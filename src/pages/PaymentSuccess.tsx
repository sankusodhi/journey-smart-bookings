import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CongratulationsModal from "@/components/CongratulationsModal";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<any>(null);
  const [busData, setBusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCongratulations, setShowCongratulations] = useState(false);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        throw bookingError;
      }

      setBooking(bookingData);

      // Fetch bus details
      const { data: busDetails, error: busError } = await supabase
        .from('buses')
        .select('*')
        .eq('id', bookingData.bus_id)
        .single();

      if (busError) {
        throw busError;
      }

      setBusData(busDetails);
      setShowCongratulations(true);

    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch booking details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = () => {
    // Create a simple ticket download
    const ticketData = {
      bookingId: booking.id,
      busName: busData.bus_name,
      route: `${busData.source} → ${busData.destination}`,
      seats: booking.selected_seats.join(', '),
      amount: booking.total_amount,
      bookingDate: new Date(booking.booked_at).toLocaleDateString()
    };

    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `bus-ticket-${booking.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-journey mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (!booking || !busData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8">
              <h1 className="text-2xl font-bold text-destructive mb-4">Booking Not Found</h1>
              <p className="text-muted-foreground mb-6">
                We couldn't find your booking details. Please contact support if you believe this is an error.
              </p>
              <Button onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-green-800 mb-2">Payment Successful! 🎉</h1>
              <p className="text-green-700 text-lg">Your bus booking has been confirmed</p>
              <p className="text-sm text-green-600 mt-2">
                Booking ID: <span className="font-mono font-bold">{booking.id}</span>
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Bus Information</h3>
                  <p className="font-bold text-lg">{busData.bus_name}</p>
                  <p className="text-muted-foreground">{busData.source} → {busData.destination}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Travel Date & Time</h3>
                  <p className="font-semibold">
                    {new Date(busData.departure_time).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-muted-foreground">
                    Departure: {new Date(busData.departure_time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Seats</h3>
                  <p className="font-bold text-lg">{booking.selected_seats.join(', ')}</p>
                  <p className="text-muted-foreground">{booking.selected_seats.length} seat(s) booked</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Amount Paid</h3>
                  <p className="font-bold text-2xl text-journey">₹{booking.total_amount}</p>
                  <p className="text-sm text-muted-foreground">
                    Coins earned: <span className="font-semibold text-yellow-600">{booking.coins_earned || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={downloadTicket}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Ticket
            </Button>
            
            <Button 
              variant="hero"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              Continue Exploring
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Important Notes */}
          <Card className="p-6 mt-8 bg-muted/30">
            <h3 className="font-bold mb-3">📋 Important Notes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Please carry a valid photo ID during travel</li>
              <li>• Reach the boarding point at least 15 minutes before departure</li>
              <li>• Your ticket details have been sent to your registered email</li>
              <li>• For any queries, contact our customer support</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Congratulations Modal */}
      <CongratulationsModal
        isOpen={showCongratulations}
        onClose={() => setShowCongratulations(false)}
        coinsEarned={booking?.coins_earned || 0}
        bookingDetails={{
          busName: busData?.bus_name || '',
          route: `${busData?.source} → ${busData?.destination}` || '',
          seats: booking?.selected_seats || [],
          amount: booking?.total_amount || 0
        }}
      />
    </div>
  );
};

export default PaymentSuccess;