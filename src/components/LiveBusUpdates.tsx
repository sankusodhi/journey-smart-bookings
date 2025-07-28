import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Loader2 } from "lucide-react";
import { useRealtimeBuses } from "@/hooks/useRealtimeBuses";
import { useNavigate } from "react-router-dom";

const LiveBusUpdates = () => {
  const { buses, loading, error } = useRealtimeBuses();
  const navigate = useNavigate();

  // Helper function to format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Bus Updates</h2>
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading real-time data...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Bus Updates</h2>
            <p className="text-red-500">Error loading live data: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl font-bold">Live Bus Updates</h2>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xl text-muted-foreground">
            Real-time bus schedules and availability
          </p>
        </div>

        {buses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No buses available at the moment</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {buses.slice(0, 6).map((bus) => (
                <Card key={bus.id} className="p-6 hover:shadow-glow transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{bus.bus_name}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Live
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{bus.source} → {bus.destination}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Dep: {formatTime(bus.departure_time)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Arr: {formatTime(bus.arrival_time)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">₹{bus.price}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        Available
                      </div>
                    </div>
                    
                    <Button 
                      variant="hero" 
                      className="w-full mt-4"
                      onClick={() => navigate(`/payment/${bus.id}`)}
                    >
                      Book Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/search-results')}
              >
                View All {buses.length} Buses
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LiveBusUpdates;