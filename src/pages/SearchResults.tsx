import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Star, Wifi, Zap, Snowflake, Users, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useRealtimeBuses } from "@/hooks/useRealtimeBuses";

const SearchResults = () => {
  const navigate = useNavigate();
  const [selectedSort, setSelectedSort] = useState("departure");
  const { buses: realtimeBuses, loading, error } = useRealtimeBuses();

  // Helper function to format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Helper function to calculate duration
  const calculateDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading buses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading buses: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Summary */}
      <div className="bg-gradient-hero text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Live Bus Routes</h1>
              <p className="text-white/90">Real-time data • {realtimeBuses.length} buses found</p>
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

              {/* Routes */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Routes</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Geedam → Raipur</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Bijapur → Raipur</span>
                  </label>
                </div>
              </div>

              {/* Real-time Status */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Status</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Live Updates Active</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{realtimeBuses.length} buses found</h2>
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
              </div>
            </div>

            {/* Bus Cards */}
            <div className="space-y-4">
              {realtimeBuses.map((bus) => (
                <Card key={bus.id} className="p-6 hover:shadow-glow transition-all duration-300">
                  <div className="grid md:grid-cols-6 gap-4 items-center">
                    {/* Operator & Route */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{bus.bus_name}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Live
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-1">{bus.source} → {bus.destination}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">4.2</span>
                        <span className="text-muted-foreground">(Real-time)</span>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatTime(bus.departure_time)}</div>
                      <div className="text-sm text-muted-foreground">{bus.source}</div>
                      <div className="my-2">
                        <Clock className="w-4 h-4 mx-auto text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">{calculateDuration(bus.departure_time, bus.arrival_time)}</div>
                      </div>
                      <div className="text-2xl font-bold">{formatTime(bus.arrival_time)}</div>
                      <div className="text-sm text-muted-foreground">{bus.destination}</div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Snowflake className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Real-time tracking
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{bus.price}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        Available
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="hero" 
                        className="w-full"
                        onClick={() => navigate(`/payment/${bus.id}`)}
                      >
                        Book Now
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {realtimeBuses.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No buses found for your search</p>
                <Button onClick={() => window.location.reload()}>Refresh</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;