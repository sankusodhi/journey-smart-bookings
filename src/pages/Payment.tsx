import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle2, QrCode } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CongratulationsModal from "@/components/CongratulationsModal";
import QRCode from "qrcode";

// Add Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { addCoins } = useAuth();
  
  const [busData, setBusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'razorpay' | 'upi' | 'cards' | 'netbanking'>('razorpay');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);

  const selectedSeats = searchParams.get('seats')?.split(',') || [];
  const contactInfo = searchParams.get('contact') ? JSON.parse(decodeURIComponent(searchParams.get('contact')!)) : {};
  const passengers = searchParams.get('passengers') ? JSON.parse(decodeURIComponent(searchParams.get('passengers')!)) : [];

  useEffect(() => {
    fetchBusData();
  }, [busId]);

  const fetchBusData = async () => {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .eq('id', parseInt(busId!))
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch bus details",
          variant: "destructive"
        });
        return;
      }

      setBusData(data);
    } catch (error) {
      console.error('Error fetching bus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processStripePayment = async () => {
    const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
      body: {
        busId: busId!,
        selectedSeats,
        passengerDetails: passengers,
        contactInfo,
        totalAmount: totalAmount,
        coinsUsed: 0
      }
    });

    if (paymentError) {
      throw new Error(paymentError.message || "Stripe payment failed");
    }

    if (paymentData?.url) {
      window.location.href = paymentData.url;
    }
  };

  const processRazorpayPayment = async () => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    await new Promise((resolve) => {
      script.onload = resolve;
    });

    const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-payment', {
      body: {
        busId: busId!,
        selectedSeats,
        passengerDetails: passengers,
        contactInfo,
        totalAmount: totalAmount,
        coinsUsed: 0
      }
    });

    if (orderError) {
      throw new Error(orderError.message || "Razorpay order creation failed");
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Bus Booking',
      description: `Bus ticket for ${busData.bus_name}`,
      order_id: orderData.orderId,
      handler: function (response: any) {
        // Payment successful
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed.",
        });
        setPaymentComplete(true);
        setShowCongratulations(true);
      },
      prefill: {
        name: contactInfo.name || '',
        email: contactInfo.email || '',
        contact: contactInfo.phone || ''
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        ondismiss: function() {
          setProcessing(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const generateUPIQRCode = async () => {
    const upiString = `upi://pay?pa=demo@paytm&pn=BusBooking&am=${totalAmount}&cu=INR&tn=Bus Booking Payment`;
    try {
      const qrCodeDataURL = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeData(qrCodeDataURL);
      setShowQRCode(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const processPayment = async () => {
    setProcessing(true);
    
    try {
      if (selectedPaymentMethod === 'upi') {
        await generateUPIQRCode();
        setProcessing(false);
        return;
      }
      
      if (selectedPaymentMethod === 'stripe') {
        await processStripePayment();
      } else {
        await processRazorpayPayment();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  if (loading || !busData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-journey mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const totalAmount = selectedSeats.length * Number(busData.price) + Math.round(selectedSeats.length * Number(busData.price) * 0.05);

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
              <p className="text-green-700 mb-4">Your bus booking has been confirmed</p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <p><strong>Bus:</strong> {busData.bus_name}</p>
                <p><strong>Route:</strong> {busData.source} → {busData.destination}</p>
                <p><strong>Seats:</strong> {selectedSeats.join(', ')}</p>
                <p><strong>Amount Paid:</strong> ₹{totalAmount}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting to home page in a few seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Progress Header */}
      <div className="bg-gradient-hero text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="icon"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Payment</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-journey font-bold flex items-center justify-center text-sm">✓</div>
              <span className="text-sm">Select Seats</span>
            </div>
            <div className="w-8 h-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-journey font-bold flex items-center justify-center text-sm">✓</div>
              <span className="text-sm">Passenger Details</span>
            </div>
            <div className="w-8 h-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-journey text-white font-bold flex items-center justify-center text-sm">3</div>
              <span className="text-sm">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-journey" />
                Payment Methods
              </h3>
              
              <div className="space-y-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === 'stripe' 
                      ? 'border-journey bg-journey/5' 
                      : 'border-border hover:border-journey/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('stripe')}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="text-journey" 
                      checked={selectedPaymentMethod === 'stripe'}
                      onChange={() => setSelectedPaymentMethod('stripe')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Stripe</div>
                      <div className="text-sm text-muted-foreground">Credit/Debit Cards, International</div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Secure
                    </Badge>
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === 'upi' 
                      ? 'border-journey bg-journey/5' 
                      : 'border-border hover:border-journey/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('upi')}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="text-journey"
                      checked={selectedPaymentMethod === 'upi'}
                      onChange={() => setSelectedPaymentMethod('upi')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">UPI / GPay / PhonePe</div>
                      <div className="text-sm text-muted-foreground">Quick UPI payments</div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Instant
                    </Badge>
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === 'cards' 
                      ? 'border-journey bg-journey/5' 
                      : 'border-border hover:border-journey/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('cards')}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="text-journey"
                      checked={selectedPaymentMethod === 'cards'}
                      onChange={() => setSelectedPaymentMethod('cards')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Credit/Debit Cards</div>
                      <div className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Secure
                    </Badge>
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === 'netbanking' 
                      ? 'border-journey bg-journey/5' 
                      : 'border-border hover:border-journey/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('netbanking')}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="text-journey"
                      checked={selectedPaymentMethod === 'netbanking'}
                      onChange={() => setSelectedPaymentMethod('netbanking')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Net Banking</div>
                      <div className="text-sm text-muted-foreground">All major banks</div>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Banking
                    </Badge>
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === 'razorpay' 
                      ? 'border-journey bg-journey/5' 
                      : 'border-border hover:border-journey/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('razorpay')}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="text-journey"
                      checked={selectedPaymentMethod === 'razorpay'}
                      onChange={() => setSelectedPaymentMethod('razorpay')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">All Payment Options</div>
                      <div className="text-sm text-muted-foreground">UPI, Cards, Net Banking, Wallets</div>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Terms & Conditions */}
            <Card className="p-6 bg-muted/30">
              <h3 className="font-bold mb-3">📋 Terms & Conditions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Cancellation charges apply as per our cancellation policy</li>
                <li>• No refund for no-show or missed buses</li>
                <li>• Tickets are non-transferable</li>
                <li>• Please carry valid ID proof during travel</li>
                <li>• Reach boarding point 15 minutes before departure</li>
              </ul>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="font-semibold">{busData.bus_name}</div>
                  <div className="text-sm text-muted-foreground">{busData.source} → {busData.destination}</div>
                </div>
                
                <div className="text-sm">
                  <div className="font-semibold">
                    {new Date(busData.departure_time).toLocaleDateString()} • {new Date(busData.departure_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Selected Seats:</span>
                    <span className="font-semibold">{selectedSeats.join(", ")}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Base Fare:</span>
                    <span>₹{Number(busData.price)} × {selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Taxes & Fees:</span>
                    <span>₹{Math.round(selectedSeats.length * Number(busData.price) * 0.05)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-journey">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                variant="hero" 
                className="w-full mb-4"
                onClick={processPayment}
                disabled={processing}
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{totalAmount}
                  </>
                )}
              </Button>

              {/* Security Badge */}
              <div className="text-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  256-bit SSL Encrypted
                </Badge>
              </div>
            </Card>

            {/* UPI QR Code Modal */}
            {showQRCode && (
              <Card className="p-6 mt-4 border-journey bg-journey/5">
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5 text-journey" />
                    UPI QR Code Payment
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan this QR code with any UPI app (GPay, PhonePe, Paytm)
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <img src={qrCodeData} alt="UPI QR Code" className="w-64 h-64" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Amount:</strong> ₹{totalAmount}</p>
                    <p><strong>Merchant:</strong> Bus Booking Demo</p>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => {
                        setPaymentComplete(true);
                        setShowCongratulations(true);
                        toast({
                          title: "Payment Successful!",
                          description: "Demo payment completed successfully",
                        });
                      }}
                    >
                      ✓ Demo Payment Complete
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowQRCode(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Congratulations Modal */}
      <CongratulationsModal
        isOpen={showCongratulations}
        onClose={() => {
          setShowCongratulations(false);
          setTimeout(() => navigate('/'), 1000);
        }}
        coinsEarned={50}
        bookingDetails={{
          busName: busData.bus_name,
          route: `${busData.source} → ${busData.destination}`,
          seats: selectedSeats,
          amount: totalAmount
        }}
      />
    </div>
  );
};

export default Payment;