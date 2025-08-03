-- Create enhanced booking system with real-time seat management

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create enum for seat status
CREATE TYPE seat_status AS ENUM ('available', 'locked', 'booked');

-- Enhanced profiles table with roles and coins
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user',
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Create seat_locks table for temporary seat locking
CREATE TABLE public.seat_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id BIGINT NOT NULL REFERENCES public.buses(id),
  seat_number TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '10 minutes'),
  UNIQUE(bus_id, seat_number)
);

-- Enhanced bookings table
DROP TABLE IF EXISTS public.bookings CASCADE;
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  bus_id BIGINT NOT NULL REFERENCES public.buses(id),
  passenger_details JSONB NOT NULL,
  contact_info JSONB NOT NULL,
  selected_seats TEXT[] NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  coins_used INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  booking_status booking_status DEFAULT 'pending',
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create coin_transactions table for tracking coin history
CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  booking_id UUID REFERENCES public.bookings(id),
  amount INTEGER NOT NULL, -- positive for earning, negative for spending
  transaction_type TEXT NOT NULL, -- 'earned', 'spent', 'refund'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bus_seats table for seat layout management
CREATE TABLE public.bus_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id BIGINT NOT NULL REFERENCES public.buses(id),
  seat_number TEXT NOT NULL,
  seat_type TEXT DEFAULT 'regular', -- 'regular', 'sleeper', 'premium'
  is_available BOOLEAN DEFAULT true,
  UNIQUE(bus_id, seat_number)
);

-- Enable RLS on all tables
ALTER TABLE public.seat_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_seats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seat_locks
CREATE POLICY "Users can view their own seat locks" ON public.seat_locks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create seat locks" ON public.seat_locks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seat locks" ON public.seat_locks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all seat locks" ON public.seat_locks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for coin_transactions
CREATE POLICY "Users can view their own coin transactions" ON public.coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create coin transactions" ON public.coin_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all coin transactions" ON public.coin_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bus_seats
CREATE POLICY "Anyone can view bus seats" ON public.bus_seats
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage bus seats" ON public.bus_seats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to clean up expired seat locks
CREATE OR REPLACE FUNCTION clean_expired_seat_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM public.seat_locks 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to lock seats
CREATE OR REPLACE FUNCTION lock_seats(
  p_bus_id BIGINT,
  p_seat_numbers TEXT[],
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  seat_num TEXT;
BEGIN
  -- Clean expired locks first
  PERFORM clean_expired_seat_locks();
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release seat locks
CREATE OR REPLACE FUNCTION release_seat_locks(
  p_bus_id BIGINT,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  DELETE FROM public.seat_locks 
  WHERE bus_id = p_bus_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add coins to user
CREATE OR REPLACE FUNCTION add_coins_to_user(
  p_user_id UUID,
  p_amount INTEGER,
  p_booking_id UUID DEFAULT NULL,
  p_transaction_type TEXT DEFAULT 'earned',
  p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to confirm booking and award coins
CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id UUID,
  p_payment_id TEXT
)
RETURNS void AS $$
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
  PERFORM add_coins_to_user(
    booking_record.user_id,
    coins_to_award,
    p_booking_id,
    'earned',
    'Booking reward coins'
  );
  
  -- Release any seat locks for this user and bus
  PERFORM release_seat_locks(booking_record.bus_id, booking_record.user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for real-time updates
CREATE OR REPLACE FUNCTION notify_seat_changes()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('seat_changes', json_build_object(
    'bus_id', COALESCE(NEW.bus_id, OLD.bus_id),
    'action', TG_OP,
    'seat_number', COALESCE(NEW.seat_number, OLD.seat_number)
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seat_locks_notify
  AFTER INSERT OR UPDATE OR DELETE ON public.seat_locks
  FOR EACH ROW EXECUTE FUNCTION notify_seat_changes();

CREATE TRIGGER bookings_notify
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION notify_seat_changes();

-- Enable realtime for all tables
ALTER TABLE public.seat_locks REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.coin_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.bus_seats REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.seat_locks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coin_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_seats;

-- Initialize default seat layout for existing buses
INSERT INTO public.bus_seats (bus_id, seat_number, seat_type)
SELECT 
  id as bus_id,
  seat_num as seat_number,
  CASE 
    WHEN seat_num LIKE '%A' OR seat_num LIKE '%D' THEN 'window'
    WHEN seat_num LIKE '%B' OR seat_num LIKE '%C' THEN 'aisle'
    ELSE 'regular'
  END as seat_type
FROM public.buses,
LATERAL (
  SELECT 
    row_num::text || seat_letter as seat_num
  FROM generate_series(1, 10) as row_num,
       unnest(ARRAY['A', 'B', 'C', 'D']) as seat_letter
) seats
ON CONFLICT (bus_id, seat_number) DO NOTHING;