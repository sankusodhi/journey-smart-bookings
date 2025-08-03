-- Fix security warnings: Update function search paths and refine RLS policies

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION clean_expired_seat_locks()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.seat_locks 
  WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION lock_seats(
  p_bus_id BIGINT,
  p_seat_numbers TEXT[],
  p_user_id UUID
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  seat_num TEXT;
BEGIN
  -- Clean expired locks first
  PERFORM public.clean_expired_seat_locks();
  
  -- Check if any seats are already locked or booked
  FOR seat_num IN SELECT unnest(p_seat_numbers) LOOP
    IF EXISTS (
      SELECT 1 FROM public.seat_locks 
      WHERE bus_id = p_bus_id AND seat_number = seat_num
    ) THEN
      RETURN FALSE;
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.bus_id = p_bus_id 
      AND seat_num = ANY(b.selected_seats)
      AND b.booking_status IN ('confirmed', 'pending')
    ) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  -- Lock all seats
  FOR seat_num IN SELECT unnest(p_seat_numbers) LOOP
    INSERT INTO public.seat_locks (bus_id, seat_number, user_id)
    VALUES (p_bus_id, seat_num, p_user_id);
  END LOOP;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION release_seat_locks(
  p_bus_id BIGINT,
  p_user_id UUID
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.seat_locks 
  WHERE bus_id = p_bus_id AND user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION add_coins_to_user(
  p_user_id UUID,
  p_amount INTEGER,
  p_booking_id UUID DEFAULT NULL,
  p_transaction_type TEXT DEFAULT 'earned',
  p_description TEXT DEFAULT NULL
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Update user's coin balance
  UPDATE public.profiles 
  SET coins = coins + p_amount
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.coin_transactions (
    user_id, booking_id, amount, transaction_type, description
  ) VALUES (
    p_user_id, p_booking_id, p_amount, p_transaction_type, p_description
  );
END;
$$;

CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id UUID,
  p_payment_id TEXT
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  booking_record public.bookings%ROWTYPE;
  coins_to_award INTEGER;
BEGIN
  SELECT * INTO booking_record 
  FROM public.bookings 
  WHERE id = p_booking_id;
  
  -- Calculate coins (1 coin per 100 rupees spent)
  coins_to_award := FLOOR(booking_record.total_amount / 100);
  
  -- Update booking status
  UPDATE public.bookings 
  SET 
    booking_status = 'confirmed',
    payment_status = 'completed',
    payment_id = p_payment_id,
    coins_earned = coins_to_award,
    updated_at = now()
  WHERE id = p_booking_id;
  
  -- Award coins
  PERFORM public.add_coins_to_user(
    booking_record.user_id,
    coins_to_award,
    p_booking_id,
    'earned',
    'Booking reward coins'
  );
  
  -- Release any seat locks for this user and bus
  PERFORM public.release_seat_locks(booking_record.bus_id, booking_record.user_id);
END;
$$;

CREATE OR REPLACE FUNCTION notify_seat_changes()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  PERFORM pg_notify('seat_changes', json_build_object(
    'bus_id', COALESCE(NEW.bus_id, OLD.bus_id),
    'action', TG_OP,
    'seat_number', COALESCE(NEW.seat_number, OLD.seat_number)
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update RLS policies to require authentication (fix anonymous access warnings)
DROP POLICY IF EXISTS "Anyone can view bus seats" ON public.bus_seats;
CREATE POLICY "Authenticated users can view bus seats" ON public.bus_seats
  FOR SELECT USING (auth.role() = 'authenticated');

-- Restrict existing policies to authenticated users only
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
CREATE POLICY "Users can create their own bookings" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update other policies similarly
DROP POLICY IF EXISTS "Users can view their own coin transactions" ON public.coin_transactions;
CREATE POLICY "Users can view their own coin transactions" ON public.coin_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all coin transactions" ON public.coin_transactions;
CREATE POLICY "Admins can view all coin transactions" ON public.coin_transactions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view their own seat locks" ON public.seat_locks;
CREATE POLICY "Users can view their own seat locks" ON public.seat_locks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create seat locks" ON public.seat_locks;
CREATE POLICY "Users can create seat locks" ON public.seat_locks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own seat locks" ON public.seat_locks;
CREATE POLICY "Users can update their own seat locks" ON public.seat_locks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all seat locks" ON public.seat_locks;
CREATE POLICY "Admins can view all seat locks" ON public.seat_locks
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage bus seats" ON public.bus_seats;
CREATE POLICY "Admins can manage bus seats" ON public.bus_seats
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );