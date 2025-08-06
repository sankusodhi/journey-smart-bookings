import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Star, Wifi, Zap, Snowflake, Users, Loader2, MapPin, Calendar } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { useThirdPartyBuses } from "@/hooks/useThirdPartyBuses";
import type { ThirdPartyBus } from "@/services/busApiService";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSort, setSelectedSort] = useState("departure");
  
  // Get search parameters from URL
  const source = searchParams.get('source') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const passengers = parseInt(searchParams.get('passengers') || '1');

  const { buses, loading, error, searchBuses } = useThirdPartyBuses();

  // Search for buses when component mounts or search params change
  useEffect(() => {
    if (source && destination) {
      searchBuses({
        source,
        destination,
        date,
        passengers,
      });
    }
  }, [source, destination, date, passengers]);

  // Helper function to format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Sort buses based on selected criteria
  const sortedBuses = [...buses].sort((a, b) => {
    switch (selectedSort) {
      case 'price':
        return a.price - b.price;
      case 'departure':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'duration':
        return parseInt(a.duration) - parseInt(b.duration);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Get provider badge color
  const getProviderBadge = (provider: string) => {
    const colors = {
      abhibus: 'bg-blue-100 text-blue-700',
      redbus: 'bg-red-100 text-red-700',
      internal: 'bg-green-100 text-green-700',
      mock: 'bg-purple-100 text-purple-700',
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-700';
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
              <h1 className="text-2xl font-bold mb-2">Available Buses</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {source} → {destination}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(date).toLocaleDateString()}
                </div>
                <div>{buses.length} buses found</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/')}
            >
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
              <h2 className="text-xl font-bold">{buses.length} buses found from multiple providers</h2>
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
                  variant={selectedSort === "duration" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedSort("duration")}
                >
                  Duration
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
              {sortedBuses.map((bus) => (
                <Card key={bus.id} className="p-6 hover:shadow-glow transition-all duration-300">
                  <div className="grid md:grid-cols-6 gap-4 items-center">
                    {/* Operator & Route */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{bus.operator}</h3>
                        <Badge variant="secondary" className={getProviderBadge(bus.provider)}>
                          {bus.provider.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {bus.busType}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-1">{bus.source} → {bus.destination}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{bus.rating}</span>
                        <span className="text-muted-foreground">({bus.reviews} reviews)</span>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatTime(bus.departureTime)}</div>
                      <div className="text-sm text-muted-foreground">{bus.source}</div>
                      <div className="my-2">
                        <Clock className="w-4 h-4 mx-auto text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">{bus.duration}</div>
                      </div>
                      <div className="text-2xl font-bold">{formatTime(bus.arrivalTime)}</div>
                      <div className="text-sm text-muted-foreground">{bus.destination}</div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {bus.amenities.slice(0, 3).map((amenity, index) => (
                          <div key={index} className="flex items-center gap-1 text-sm text-muted-foreground">
                            {amenity === 'WiFi' && <Wifi className="w-4 h-4" />}
                            {amenity === 'Charging Point' && <Zap className="w-4 h-4" />}
                            {amenity === 'AC' && <Snowflake className="w-4 h-4" />}
                            <span className="text-xs">{amenity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bus.amenities.length > 3 ? `+${bus.amenities.length - 3} more` : 'All amenities'}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{bus.price}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        {bus.availableSeats} seats left
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="hero" 
                        className="w-full"
                        onClick={() => navigate(`/seat-selection/${bus.id}?provider=${bus.provider}`)}
                        disabled={bus.availableSeats === 0}
                      >
                        {bus.availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/bus-details/${bus.id}?provider=${bus.provider}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {buses.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No buses found for this route</p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Try searching for a different route or date</p>
                  <Button onClick={() => navigate('/')}>Search Again</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;