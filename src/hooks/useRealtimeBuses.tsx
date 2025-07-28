import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Bus {
  id: number;
  source: string;
  destination: string;
  bus_name: string;
  departure_time: string;
  arrival_time: string;
  price: number;
}

export const useRealtimeBuses = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchBuses = async () => {
      try {
        const { data, error } = await supabase
          .from('buses')
          .select('*')
          .order('departure_time');
        
        if (error) {
          setError(error.message);
          return;
        }
        
        setBuses(data || []);
      } catch (err) {
        setError('Failed to fetch buses');
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();

    // Set up real-time subscription
    const channel = supabase
      .channel('buses-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'buses'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setBuses(prev => [...prev, payload.new as Bus].sort((a, b) => 
              new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
            ));
          } else if (payload.eventType === 'UPDATE') {
            setBuses(prev => prev.map(bus => 
              bus.id === payload.new.id ? payload.new as Bus : bus
            ));
          } else if (payload.eventType === 'DELETE') {
            setBuses(prev => prev.filter(bus => bus.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { buses, loading, error };
};