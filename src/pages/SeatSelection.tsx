import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Clock, User, Wifi, Zap, Snowflake } from "lucide-react";
import Header from "@/components/Header";

const SeatSelection = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Mock bus data - in real app, fetch based on busId
  const busData = {
    id: 1,
    operator: "IntrCity SmartBus",
    route: "Delhi → Mumbai",
    departure: "22:30",
    arrival: "14:30+1",
    duration: "16h 00m",
    price: 1299,
    busType: "AC Sleeper",
    amenities: ["wifi", "charging", "ac", "water"]
  };

  // Seat layout - Lower and Upper deck
  const seatLayout = {
    lower: [
      ["L1", "L2", "", "L3", "L4"],
      ["L5", "L6", "", "L7", "L8"],
      ["L9", "L10", "", "L11", "L12"],
      ["L13", "L14", "", "L15", "L16"],
      ["L17", "L18", "", "L19", "L20"],
      ["", "", "", "", ""],
      ["L21", "L22", "", "L23", "L24"],
      ["L25", "L26", "", "L27", "L28"]
    ],
    upper: [
      ["U1", "U2", "", "U3", "U4"],
      ["U5", "U6", "", "U7", "U8"],
      ["U9", "U10", "", "U11", "U12"],
      ["U13", "U14", "", "U15", "U16"],
      ["U17", "U18", "", "U19", "U20"],
      ["", "", "", "", ""],
      ["U21", "U22", "", "U23", "U24"],
      ["U25", "U26", "", "U27", "U28"]
    ]
  };

  const bookedSeats = ["L2", "L7", "L15", "U5", "U12", "U20"];
  const femaleSeats = ["L1", "L9", "U1", "U9"];

  const getSeatStatus = (seatNumber: string) => {
    if (!seatNumber) return "empty";
    if (bookedSeats.includes(seatNumber)) return "booked";
    if (femaleSeats.includes(seatNumber)) return "female";
    if (selectedSeats.includes(seatNumber)) return "selected";
    return "available";
  };

  const getSeatClass = (status: string) => {
    switch (status) {
      case "booked": return "bg-red-500 text-white cursor-not-allowed";
      case "female": return "bg-pink-300 text-pink-800 hover:bg-pink-400 cursor-pointer";
      case "selected": return "bg-journey text-white cursor-pointer";
      case "available": return "bg-gray-200 hover:bg-gray-300 cursor-pointer border-2 border-transparent hover:border-journey";
      default: return "";
    }
  };

  const handleSeatClick = (seatNumber: string) => {
    const status = getSeatStatus(seatNumber);
    if (status === "booked" || !seatNumber) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else if (selectedSeats.length < 4) {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const totalPrice = selectedSeats.length * busData.price;

  const SeatGrid = ({ deck, deckName }: { deck: string[][], deckName: string }) => (
    <div className="bg-white rounded-lg p-4 border">
      <h3 className="font-semibold mb-4 text-center">{deckName} Deck</h3>
      <div className="grid gap-2 max-w-xs mx-auto">
        {deck.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {row.map((seat, seatIndex) => {
              const status = getSeatStatus(seat);
              return (
                <div
                  key={seatIndex}
                  className={`
                    w-8 h-8 rounded text-xs font-semibold flex items-center justify-center
                    transition-all duration-200 ${getSeatClass(status)}
                  `}
                  onClick={() => handleSeatClick(seat)}
                >
                  {seat}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Bus Info Header */}
      <div className="bg-gradient-hero text-white py-6">
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
            <div>
              <h1 className="text-2xl font-bold">{busData.operator}</h1>
              <p className="text-white/90">{busData.busType} • {busData.route}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">{busData.departure}</div>
              <div className="text-white/90">Delhi</div>
            </div>
            <div>
              <Clock className="w-5 h-5 mx-auto mb-1" />
              <div className="text-white/90">{busData.duration}</div>
            </div>
            <div>
              <div className="text-xl font-bold">{busData.arrival}</div>
              <div className="text-white/90">Mumbai</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Select Your Seats</h2>
              
              {/* Bus Layout */}
              <div className="mb-8">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold">Driver</span>
                    <div className="w-8 h-6 bg-gray-400 rounded"></div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <SeatGrid deck={seatLayout.lower} deckName="Lower" />
                  <SeatGrid deck={seatLayout.upper} deckName="Upper" />
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-journey rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-pink-300 rounded"></div>
                  <span>Ladies</span>
                </div>
              </div>
            </Card>

            {/* Boarding & Dropping Points */}
            <Card className="p-6 mt-6">
              <h3 className="font-bold mb-4">Boarding & Dropping Points</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-journey mb-2">Boarding Points</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="boarding" className="text-journey" defaultChecked />
                      <div>
                        <div className="font-medium">ISBT Kashmere Gate</div>
                        <div className="text-sm text-muted-foreground">22:00 • Platform 6</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="boarding" className="text-journey" />
                      <div>
                        <div className="font-medium">Majnu Ka Tilla</div>
                        <div className="text-sm text-muted-foreground">22:15 • Near Metro Station</div>
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-journey mb-2">Dropping Points</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="dropping" className="text-journey" defaultChecked />
                      <div>
                        <div className="font-medium">Borivali Station</div>
                        <div className="text-sm text-muted-foreground">14:15 • East Side</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="dropping" className="text-journey" />
                      <div>
                        <div className="font-medium">Andheri Station</div>
                        <div className="text-sm text-muted-foreground">14:30 • West Side</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
              
              {selectedSeats.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>Selected Seats:</span>
                      <span className="font-semibold">{selectedSeats.join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Fare:</span>
                      <span>₹{busData.price} × {selectedSeats.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Fees:</span>
                      <span>₹{Math.round(totalPrice * 0.05)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount:</span>
                        <span className="text-journey">₹{totalPrice + Math.round(totalPrice * 0.05)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="hero" 
                    className="w-full mb-4"
                    onClick={() => navigate(`/passenger-details/${busId}`)}
                  >
                    Continue to Passenger Details
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Please select at least one seat to continue</p>
                </div>
              )}

              {/* Bus Amenities */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Bus Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> Wi-Fi
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Charging
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Snowflake className="w-3 h-3" /> AC
                  </Badge>
                  <Badge variant="outline">💧 Water</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;