import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Star, Wifi, Zap, Snowflake, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const SearchResults = () => {
  const navigate = useNavigate();
  const [selectedSort, setSelectedSort] = useState("departure");

  const buses = [
    {
      id: 1,
      operator: "IntrCity SmartBus",
      route: "Delhi → Mumbai",
      departure: "22:30",
      arrival: "14:30+1",
      duration: "16h 00m",
      price: 1299,
      originalPrice: 1599,
      discount: 19,
      rating: 4.2,
      reviews: 1847,
      seatsLeft: 12,
      busType: "AC Sleeper",
      amenities: ["wifi", "charging", "ac", "water"],
      pickupPoints: 3,
      dropPoints: 4,
      isPopular: true
    },
    {
      id: 2,
      operator: "VRL Travels",
      route: "Delhi → Mumbai",
      departure: "20:15",
      arrival: "12:45+1",
      duration: "16h 30m",
      price: 999,
      originalPrice: 1299,
      discount: 23,
      rating: 4.0,
      reviews: 892,
      seatsLeft: 8,
      busType: "AC Seater",
      amenities: ["wifi", "charging", "ac"],
      pickupPoints: 5,
      dropPoints: 6,
      isPopular: false
    },
    {
      id: 3,
      operator: "RedBus Express",
      route: "Delhi → Mumbai",
      departure: "21:00",
      arrival: "13:30+1",
      duration: "16h 30m",
      price: 1499,
      originalPrice: 1799,
      discount: 17,
      rating: 4.5,
      reviews: 2156,
      seatsLeft: 4,
      busType: "Volvo AC Sleeper",
      amenities: ["wifi", "charging", "ac", "water", "blanket"],
      pickupPoints: 2,
      dropPoints: 3,
      isPopular: true
    }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="w-4 h-4" />;
      case "charging": return <Zap className="w-4 h-4" />;
      case "ac": return <Snowflake className="w-4 h-4" />;
      case "water": return "💧";
      case "blanket": return "🛏️";
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Summary */}
      <div className="bg-gradient-hero text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Delhi → Mumbai</h1>
              <p className="text-white/90">Today, 26 Jul • {buses.length} buses found</p>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              Modify Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Price Range</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>₹500 - ₹1000</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>₹1000 - ₹1500</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>₹1500+</span>
                  </label>
                </div>
              </div>

              {/* Bus Type */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Bus Type</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>AC Sleeper</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>AC Seater</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Non-AC Sleeper</span>
                  </label>
                </div>
              </div>

              {/* Departure Time */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Departure Time</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>6 AM - 12 PM</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>12 PM - 6 PM</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>6 PM - 12 AM</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{buses.length} buses found</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Button 
                  variant={selectedSort === "departure" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedSort("departure")}
                >
                  Departure
                </Button>
                <Button 
                  variant={selectedSort === "price" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedSort("price")}
                >
                  Price
                </Button>
                <Button 
                  variant={selectedSort === "rating" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedSort("rating")}
                >
                  Rating
                </Button>
              </div>
            </div>

            {/* Bus Cards */}
            <div className="space-y-4">
              {buses.map((bus) => (
                <Card key={bus.id} className="p-6 hover:shadow-glow transition-all duration-300">
                  <div className="grid md:grid-cols-6 gap-4 items-center">
                    {/* Operator & Route */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{bus.operator}</h3>
                        {bus.isPopular && (
                          <Badge variant="secondary" className="bg-journey/10 text-journey">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-1">{bus.busType}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{bus.rating}</span>
                        <span className="text-muted-foreground">({bus.reviews})</span>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="text-center">
                      <div className="text-2xl font-bold">{bus.departure}</div>
                      <div className="text-sm text-muted-foreground">Delhi</div>
                      <div className="my-2">
                        <Clock className="w-4 h-4 mx-auto text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">{bus.duration}</div>
                      </div>
                      <div className="text-2xl font-bold">{bus.arrival}</div>
                      <div className="text-sm text-muted-foreground">Mumbai</div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {bus.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-1 text-sm text-muted-foreground">
                            {getAmenityIcon(amenity)}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bus.pickupPoints} Pickup • {bus.dropPoints} Drop
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{bus.price}</div>
                      {bus.originalPrice && (
                        <div className="text-sm">
                          <span className="line-through text-muted-foreground">₹{bus.originalPrice}</span>
                          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">
                            {bus.discount}% OFF
                          </Badge>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        {bus.seatsLeft} seats left
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="hero" 
                        className="w-full"
                        onClick={() => navigate(`/select-seats/${bus.id}`)}
                      >
                        Select Seats
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;