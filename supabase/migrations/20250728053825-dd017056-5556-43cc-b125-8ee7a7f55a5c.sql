-- Enable replica identity for real-time updates
ALTER TABLE public.buses REPLICA IDENTITY FULL;

-- Add the buses table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.buses;