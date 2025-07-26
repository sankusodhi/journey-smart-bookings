import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import Header from "@/components/Header";

const PassengerDetails = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  
  const [passengers, setPassengers] = useState([
    { name: "", age: "", gender: "male", email: "", phone: "" }
  ]);

  // Mock selected seats and bus data
  const selectedSeats = ["L5", "L6"];
  const busData = {
    operator: "IntrCity SmartBus",
    route: "Delhi → Mumbai",
    departure: "22:30",
    arrival: "14:30+1",
    date: "26 Jul 2024",
    price: 1299
  };

  const addPassenger = () => {
    if (passengers.length < selectedSeats.length) {
      setPassengers([...passengers, { name: "", age: "", gender: "male", email: "", phone: "" }]);
    }
  };

  const updatePassenger = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const totalAmount = selectedSeats.length * busData.price + Math.round(selectedSeats.length * busData.price * 0.05);

  const handleContinue = () => {
    // Validate form data
    const isValid = passengers.every(p => p.name && p.age && p.email && p.phone);
    if (isValid) {
      navigate(`/payment/${busId}`);
    }
  };

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
            <h1 className="text-xl font-bold">Passenger Details</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-journey font-bold flex items-center justify-center text-sm">✓</div>
              <span className="text-sm">Select Seats</span>
            </div>
            <div className="w-8 h-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-journey text-white font-bold flex items-center justify-center text-sm">2</div>
              <span className="text-sm">Passenger Details</span>
            </div>
            <div className="w-8 h-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-sm">3</div>
              <span className="text-sm text-white/70">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Passenger Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-journey" />
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-email">Email Address *</Label>
                  <Input 
                    id="contact-email" 
                    type="email" 
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your ticket will be sent here</p>
                </div>
                <div>
                  <Label htmlFor="contact-phone">Mobile Number *</Label>
                  <Input 
                    id="contact-phone" 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">For booking updates</p>
                </div>
              </div>
            </Card>

            {/* Passenger Details */}
            {passengers.map((passenger, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-journey" />
                    Passenger {index + 1} - Seat {selectedSeats[index]}
                  </h3>
                  {passengers.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removePassenger(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor={`name-${index}`}>Full Name *</Label>
                    <Input 
                      id={`name-${index}`}
                      placeholder="Enter full name"
                      value={passenger.name}
                      onChange={(e) => updatePassenger(index, "name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`age-${index}`}>Age *</Label>
                    <Input 
                      id={`age-${index}`}
                      type="number"
                      placeholder="25"
                      value={passenger.age}
                      onChange={(e) => updatePassenger(index, "age", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`gender-${index}`}>Gender *</Label>
                    <select 
                      id={`gender-${index}`}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-md"
                      value={passenger.gender}
                      onChange={(e) => updatePassenger(index, "gender", e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Individual contact for first passenger */}
                {index === 0 && (
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor={`email-${index}`}>Email Address</Label>
                      <Input 
                        id={`email-${index}`}
                        type="email"
                        placeholder="passenger@email.com"
                        value={passenger.email}
                        onChange={(e) => updatePassenger(index, "email", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`phone-${index}`}>Mobile Number</Label>
                      <Input 
                        id={`phone-${index}`}
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={passenger.phone}
                        onChange={(e) => updatePassenger(index, "phone", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {/* Add Passenger Button */}
            {passengers.length < selectedSeats.length && (
              <Button 
                variant="outline" 
                onClick={addPassenger}
                className="w-full border-dashed"
              >
                + Add Passenger for Seat {selectedSeats[passengers.length]}
              </Button>
            )}

            {/* Travel Guidelines */}
            <Card className="p-6 bg-muted/30">
              <h3 className="font-bold mb-3">📋 Important Travel Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Please carry a valid government-issued photo ID during travel</li>
                <li>• Reach the boarding point at least 15 minutes before departure</li>
                <li>• Children above 5 years require a separate seat booking</li>
                <li>• No cancellation allowed within 2 hours of departure</li>
                <li>• SMS and email confirmations will be sent to provided contact details</li>
              </ul>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Journey Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="font-semibold">{busData.operator}</div>
                  <div className="text-sm text-muted-foreground">{busData.route}</div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-journey" />
                  <span>{busData.date}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold">{busData.departure}</div>
                    <div className="text-muted-foreground">Delhi</div>
                  </div>
                  <div>
                    <div className="font-semibold">{busData.arrival}</div>
                    <div className="text-muted-foreground">Mumbai</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Selected Seats:</span>
                    <span className="font-semibold">{selectedSeats.join(", ")}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Base Fare:</span>
                    <span>₹{busData.price} × {selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Taxes & Fees:</span>
                    <span>₹{Math.round(selectedSeats.length * busData.price * 0.05)}</span>
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
                className="w-full"
                onClick={handleContinue}
              >
                Continue to Payment
              </Button>

              {/* Security Badge */}
              <div className="mt-4 text-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  🔒 SSL Secured Payment
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;