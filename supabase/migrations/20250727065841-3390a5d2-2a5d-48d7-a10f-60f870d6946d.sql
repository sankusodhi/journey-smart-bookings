-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update RLS policies to require authentication (remove anonymous access)
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Bookings policies - require authentication
CREATE POLICY "Authenticated users can view their own bookings" 
ON public.bookings 
FOR SELECT 
TO authenticated
USING (auth.uid()::text = user_phone OR auth.email() = user_name);

CREATE POLICY "Authenticated users can create bookings" 
ON public.bookings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles policies - require authentication
CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add policy for the Buses table that has no policies (RLS enabled but no policies)
DROP POLICY IF EXISTS "Anyone can view bus schedules" ON public.buses;
CREATE POLICY "Anyone can view bus schedules" 
ON public.buses 
FOR SELECT 
TO authenticated, anon
USING (true);