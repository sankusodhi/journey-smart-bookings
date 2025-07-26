import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Star, 
  AlertCircle,
  Car,
  User,
  Wifi,
  Zap,
  Snowflake
} from "lucide-react";
import Header from "@/components/Header";

const BusTracking = () => {
  const [ticketNumber, setTicketNumber] = useState("BYT123456789");
  const [tracking, setTracking] = useState(false);

  // Mock real-time bus data
  const [busData, setBusData] = useState({
    id: "DL-1234",
    operator: "IntrCity SmartBus",
    route: "Delhi → Mumbai",
    currentLocation: "Jaipur Highway, Near Toll Plaza",
    nextStop: "Udaipur Bus Stand",
    speed: 78,
    estimatedArrival: "14:30",
    delay: 15,
    status: "On Time",
    driver: {
      name: "Rajesh Kumar",
      rating: 4.6,
      phone: "+91 98765 43210",
      photo: "👨‍✈️"
    },
    coordinates: { lat: 26.9124, lng: 75.7873 },
    completedStops: [
      { name: "Delhi ISBT", time: "22:30", status: "completed" },
      { name: "Gurgaon", time: "23:15", status: "completed" },
      { name: "Jaipur", time: "02:30", status: "completed" }
    ],
    upcomingStops: [
      { name: "Udaipur", time: "08:45", status: "upcoming" },
      { name: "Ahmedabad", time: "12:15", status: "upcoming" },
      { name: "Mumbai", time: "14:30", status: "upcoming" }
    ],
    amenities: ["AC", "WiFi", "Charging", "Water", "GPS"]
  });

  // Simulate real-time updates
  useEffect(() => {
    if (tracking) {
      const interval = setInterval(() => {
        setBusData(prev => ({
          ...prev,
          speed: Math.max(40, Math.min(85, prev.speed + (Math.random() - 0.5) * 10)),
          coordinates: {
            lat: prev.coordinates.lat + (Math.random() - 0.5) * 0.01,
            lng: prev.coordinates.lng + (Math.random() - 0.5) * 0.01
          }
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [tracking]);

  const handleTrackBus = () => {
    setTracking(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">🚌 Live Bus Tracking</h1>
          <p className="text-xl text-white/90 mb-8">Track your bus in real-time and stay updated</p>
          
          {/* Tracking Input */}
          <div className="max-w-md mx-auto flex gap-3">
            <Input 
              placeholder="Enter ticket number"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
            />
            <Button 
              variant="journey" 
              onClick={handleTrackBus}
              className="bg-white text-journey hover:bg-white/90"
            >
              Track Bus
            </Button>
          </div>
        </div>
      </div>

      {tracking && (
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Live Map & Status */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Live Map */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-journey" />
                    Live Location
                  </h2>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    🟢 Live
                  </Badge>
                </div>
                
                {/* Mock Map Container */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-80 flex items-center justify-center relative border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-journey mx-auto mb-4" />
                    <p className="text-lg font-semibold">🚌 Bus Location: {busData.currentLocation}</p>
                    <p className="text-muted-foreground">Speed: {busData.speed} km/h</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      📍 Coordinates: {busData.coordinates.lat.toFixed(4)}, {busData.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                  
                  {/* Mock bus icon */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 bg-journey rounded-full flex items-center justify-center animate-pulse">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="mr-2">
                    Next Stop: {busData.nextStop}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    ETA: {busData.estimatedArrival}
                  </Badge>
                </div>
              </Card>

              {/* Journey Progress */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Journey Progress</h3>
                
                <div className="space-y-4">
                  {/* Completed Stops */}
                  {busData.completedStops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold">{stop.name}</div>
                        <div className="text-sm text-muted-foreground">Departed at {stop.time}</div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        ✓ Completed
                      </Badge>
                    </div>
                  ))}
                  
                  {/* Current Location */}
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-journey animate-pulse flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-journey">🚌 Current Location</div>
                      <div className="text-sm text-muted-foreground">{busData.currentLocation}</div>
                    </div>
                    <Badge variant="secondary" className="bg-journey/10 text-journey">
                      Live
                    </Badge>
                  </div>
                  
                  {/* Upcoming Stops */}
                  {busData.upcomingStops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold">{stop.name}</div>
                        <div className="text-sm text-muted-foreground">Expected at {stop.time}</div>
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Live Updates */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-journey" />
                  Live Updates
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="text-sm font-semibold">2 min ago</div>
                      <div className="text-sm text-muted-foreground">Bus departed from Jaipur on time</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="text-sm font-semibold">15 min ago</div>
                      <div className="text-sm text-muted-foreground">Bus reached Jaipur, 10 min stop for refreshments</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="text-sm font-semibold">3 hours ago</div>
                      <div className="text-sm text-muted-foreground">Journey started from Delhi ISBT</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bus & Driver Info */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Bus Information */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Bus Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold">{busData.operator}</div>
                    <div className="text-sm text-muted-foreground">{busData.route}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Bus Number</div>
                    <div className="font-semibold">{busData.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {busData.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Current Speed</div>
                    <div className="font-semibold">{busData.speed} km/h</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">Amenities</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Snowflake className="w-3 h-3" /> AC
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" /> WiFi
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Charging
                    </Badge>
                    <Badge variant="outline">💧 Water</Badge>
                    <Badge variant="outline">📍 GPS</Badge>
                  </div>
                </div>
              </Card>

              {/* Driver Information */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-journey" />
                  Driver Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{busData.driver.photo}</div>
                    <div>
                      <div className="font-semibold">{busData.driver.name}</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{busData.driver.rating}</span>
                        <span className="text-sm text-muted-foreground">Driver Rating</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Driver
                  </Button>
                </div>
              </Card>

              {/* Emergency Contacts */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Emergency Contacts</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Customer Support: 1800-XXX-XXXX
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Emergency: 112
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold text-blue-800 mb-1">💡 Pro Tip</div>
                  <div className="text-xs text-blue-700">
                    Save this page for offline tracking. GPS location updates every 30 seconds.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      {!tracking && (
        <div className="container mx-auto px-4 py-12 text-center">
          <Card className="p-8 max-w-md mx-auto">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Enter your ticket number to start tracking</h3>
            <p className="text-muted-foreground">
              Get real-time updates about your bus location, estimated arrival time, and journey progress.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BusTracking;