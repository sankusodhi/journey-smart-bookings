import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SeatLock {
  id: string;
  bus_id: number;
  seat_number: string;
  user_id: string;
  locked_at: string;
  expires_at: string;
}

export interface BookedSeat {
  selected_seats: string[];
  booking_status: string;
}

export const useRealtimeSeats = (busId: number) => {
  const [seatLocks, setSeatLocks] = useState<SeatLock[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!busId) return;

    fetchInitialData();
    setupRealtimeSubscription();

    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels();
    };
  }, [busId]);

  const fetchInitialData = async () => {
    try {
      // Fetch current seat locks
      const { data: locks } = await supabase
        .from('seat_locks')
        .select('*')
        .eq('bus_id', busId)
        .gt('expires_at', new Date().toISOString());

      // Fetch confirmed/pending bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('selected_seats, booking_status')
        .eq('bus_id', busId)
        .in('booking_status', ['confirmed', 'pending']);

      setSeatLocks(locks || []);
      
      // Flatten all booked seats
      const allBookedSeats = (bookings || []).reduce((acc: string[], booking: BookedSeat) => {
        return [...acc, ...booking.selected_seats];
      }, []);
      
      setBookedSeats(allBookedSeats);
    } catch (error) {
      console.error('Error fetching seat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to seat locks changes
    const seatLocksChannel = supabase
      .channel('seat_locks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seat_locks',
          filter: `bus_id=eq.${busId}`
        },
        (payload) => {
          console.log('Seat lock change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setSeatLocks(prev => [...prev, payload.new as SeatLock]);
          } else if (payload.eventType === 'DELETE') {
            setSeatLocks(prev => prev.filter(lock => lock.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setSeatLocks(prev => prev.map(lock => 
              lock.id === payload.new.id ? payload.new as SeatLock : lock
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to bookings changes
    const bookingsChannel = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `bus_id=eq.${busId}`
        },
        (payload) => {
          console.log('Booking change:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const booking = payload.new as any;
            if (booking.booking_status === 'confirmed') {
              setBookedSeats(prev => {
                const newSeats = [...prev, ...booking.selected_seats];
                return [...new Set(newSeats)]; // Remove duplicates
              });
            }
          }
        }
      )
      .subscribe();
  };

  const lockSeats = async (seatNumbers: string[]) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('lock_seats', {
        p_bus_id: busId,
        p_seat_numbers: seatNumbers,
        p_user_id: user.id
      });

      if (error) {
        console.error('Error locking seats:', error);
        return false;
      }

      return data; // Returns boolean indicating success
    } catch (error) {
      console.error('Error locking seats:', error);
      return false;
    }
  };

  const releaseSeatLocks = async () => {
    if (!user) return;

    try {
      await supabase.rpc('release_seat_locks', {
        p_bus_id: busId,
        p_user_id: user.id
      });
    } catch (error) {
      console.error('Error releasing seat locks:', error);
    }
  };

  const getSeatStatus = (seatNumber: string) => {
    // Check if seat is booked
    if (bookedSeats.includes(seatNumber)) {
      return 'booked';
    }

    // Check if seat is locked by current user
    const userLock = seatLocks.find(
      lock => lock.seat_number === seatNumber && lock.user_id === user?.id
    );
    if (userLock) {
      return 'locked-by-user';
    }

    // Check if seat is locked by another user
    const otherLock = seatLocks.find(
      lock => lock.seat_number === seatNumber && lock.user_id !== user?.id
    );
    if (otherLock) {
      return 'locked-by-other';
    }

    return 'available';
  };

  return {
    seatLocks,
    bookedSeats,
    loading,
    lockSeats,
    releaseSeatLocks,
    getSeatStatus
  };
};