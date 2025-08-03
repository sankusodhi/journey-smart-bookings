import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (bookingId) {
      // Cancel the booking and release seat locks
      cancelBooking();
    }
  }, [bookingId]);

  const cancelBooking = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error canceling booking:', error);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  const retryPayment = () => {
    if (bookingId) {
      // Navigate back to payment with the same booking
      navigate(`/payment/${bookingId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          
          <Card className="p-8">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-destructive mb-2">Payment Cancelled</h1>
            <p className="text-muted-foreground mb-6">
              Your payment was cancelled and no charges were made to your account.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800 text-sm">
                <strong>Note:</strong> Your seat selection has been released and may no longer be available if you choose to continue with the booking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to Home
              </Button>
              
              <Button 
                variant="hero"
                onClick={() => navigate('/search-results')}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Search Again
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              If you experienced any issues during payment, please contact our customer support.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;