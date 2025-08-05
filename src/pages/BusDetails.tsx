import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Clock, Star, Wifi, Zap, Snowflake, Users, MapPin, 
  Shield, CheckCircle, AlertCircle, Coffee, Heart, ThumbsUp, User
} from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BusDetails = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [busData, setBusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !busData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-journey mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bus details...</p>
        </div>
      </div>
    );
  }

  const reviews = [
    {
      id: 1,
      user: "Rahul S.",
      rating: 5,
      comment: "Excellent service! Bus was clean and on time. AC was working perfectly.",
      date: "2 days ago",
      verified: true
    },
    {
      id: 2,
      user: "Priya M.",
      rating: 4,
      comment: "Good journey overall. Seats were comfortable. Driver was professional.",
      date: "1 week ago",
      verified: true
    },
    {
      id: 3,
      user: "Amit K.",
      rating: 5,
      comment: "Best bus service! Wi-Fi worked throughout the journey. Highly recommended!",
      date: "2 weeks ago",
      verified: false
    }
  ];

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    return `${hours}h 00m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Bus Header */}
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
              <h1 className="text-2xl font-bold">{busData.bus_name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <span>AC Sleeper • {busData.source} → {busData.destination}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.2 (156 reviews)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">{formatTime(busData.departure_time)}</div>
              <div className="text-white/90">{busData.source}</div>
            </div>
            <div>
              <Clock className="w-5 h-5 mx-auto mb-1" />
              <div className="text-white/90">{calculateDuration(busData.departure_time, busData.arrival_time)}</div>
            </div>
            <div>
              <div className="text-xl font-bold">{formatTime(busData.arrival_time)}</div>
              <div className="text-white/90">{busData.destination}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">₹{busData.price}</div>
              <div className="text-white/90">per seat</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="route">Route</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Why Book This Bus */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Why Book This Bus?
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>4.2★ Highly Rated</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>On-time Performance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Clean & Comfortable</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Professional Driver</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Live Tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </Card>

                {/* Amenities */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Bus Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                      <Wifi className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium">Free Wi-Fi</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg">
                      <Zap className="w-8 h-8 text-yellow-600 mb-2" />
                      <span className="text-sm font-medium">Charging Points</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-cyan-50 rounded-lg">
                      <Snowflake className="w-8 h-8 text-cyan-600 mb-2" />
                      <span className="text-sm font-medium">AC</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
                      <Coffee className="w-8 h-8 text-amber-600 mb-2" />
                      <span className="text-sm font-medium">Refreshments</span>
                    </div>
                  </div>
                </Card>

                {/* Boarding & Dropping Points */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Pickup & Drop Points</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-journey mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Boarding Points
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">ISBT Kashmere Gate</div>
                          <div className="text-sm text-muted-foreground">22:00 • Platform 6</div>
                          <div className="text-xs text-green-600">Primary pickup point</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Majnu Ka Tilla</div>
                          <div className="text-sm text-muted-foreground">22:15 • Near Metro Station</div>
                          <div className="text-xs text-blue-600">Additional pickup</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-journey mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Dropping Points
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Borivali Station</div>
                          <div className="text-sm text-muted-foreground">14:15 • East Side</div>
                          <div className="text-xs text-green-600">Primary drop point</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Andheri Station</div>
                          <div className="text-sm text-muted-foreground">14:30 • West Side</div>
                          <div className="text-xs text-blue-600">Additional drop</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="route" className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Bus Route Map</h3>
                  
                  {/* Route Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-journey/30"></div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-journey rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                        <div>
                          <h4 className="font-semibold">{busData.source}</h4>
                          <p className="text-sm text-muted-foreground">Departure: {formatTime(busData.departure_time)}</p>
                          <p className="text-xs text-green-600">ISBT Kashmere Gate, Platform 6</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                        <div>
                          <h4 className="font-semibold">Gurgaon</h4>
                          <p className="text-sm text-muted-foreground">23:30 • 15 min stop</p>
                          <p className="text-xs text-amber-600">Rest stop - Refreshments available</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                        <div>
                          <h4 className="font-semibold">Udaipur</h4>
                          <p className="text-sm text-muted-foreground">06:00 • 30 min stop</p>
                          <p className="text-xs text-amber-600">Rest stop - Breakfast & facilities</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                        <div>
                          <h4 className="font-semibold">Surat</h4>
                          <p className="text-sm text-muted-foreground">11:30 • 20 min stop</p>
                          <p className="text-xs text-amber-600">Rest stop - Lunch break</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">5</div>
                        <div>
                          <h4 className="font-semibold">{busData.destination}</h4>
                          <p className="text-sm text-muted-foreground">Arrival: {formatTime(busData.arrival_time)}</p>
                          <p className="text-xs text-green-600">Borivali Station, East Side</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Rest Stops */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Rest Stops & Facilities</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Gurgaon Highway Plaza</h4>
                      <p className="text-sm text-muted-foreground mb-2">23:30 - 23:45 (15 min)</p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">🍕 Food Court</Badge>
                        <Badge variant="outline">🚻 Restrooms</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Udaipur Rest Stop</h4>
                      <p className="text-sm text-muted-foreground mb-2">06:00 - 06:30 (30 min)</p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">🍳 Breakfast</Badge>
                        <Badge variant="outline">☕ Coffee</Badge>
                        <Badge variant="outline">🚻 Facilities</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Ratings & Reviews</h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold">4.2</span>
                      <span className="text-muted-foreground">(156 reviews)</span>
                    </div>
                  </div>
                  
                  {/* Rating Breakdown */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm w-8">5★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">94</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm w-8">4★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{width: '30%'}}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">47</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm w-8">3★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{width: '8%'}}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">12</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm w-8">2★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{width: '2%'}}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm w-8">1★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-400 h-2 rounded-full" style={{width: '0%'}}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">0</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Cleanliness</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map((i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Punctuality</span>
                        <div className="flex gap-1">
                          {[1,2,3,4].map((i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Star className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Staff Behavior</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map((i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-journey rounded-full flex items-center justify-center text-white font-semibold">
                              {review.user[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{review.user}</span>
                                {review.verified && (
                                  <Badge variant="outline" className="text-green-600 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex gap-1">
                                  {[1,2,3,4,5].map((i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-3 h-3 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span>•</span>
                                <span>{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <ThumbsUp className="w-4 h-4 text-muted-foreground hover:text-journey cursor-pointer" />
                        </div>
                        <p className="text-sm text-muted-foreground ml-13">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="policies" className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Booking Policies
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Cancellation Policy */}
                    <div>
                      <h4 className="font-semibold mb-3 text-journey">Cancellation Policy</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>More than 24 hours before departure: Full refund</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <span>12-24 hours before departure: 75% refund</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                          <span>6-12 hours before departure: 50% refund</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>Less than 6 hours: No refund</span>
                        </div>
                      </div>
                    </div>

                    {/* Partial Cancellation */}
                    <div>
                      <h4 className="font-semibold mb-3 text-journey">Partial Cancellation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Cancel individual seats from group bookings</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Same cancellation charges apply per seat</span>
                        </div>
                      </div>
                    </div>

                    {/* Child Policy */}
                    <div>
                      <h4 className="font-semibold mb-3 text-journey">Child Policy</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>Children above 5 years need full ticket</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>Children below 5 years can travel free without seat</span>
                        </div>
                      </div>
                    </div>

                    {/* Luggage Policy */}
                    <div>
                      <h4 className="font-semibold mb-3 text-journey">Luggage Policy</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>2 pieces of luggage allowed per passenger</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Maximum 30kg total weight per passenger</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <span>Extra charges for overweight/oversized luggage</span>
                        </div>
                      </div>
                    </div>

                    {/* ID Proof Policy */}
                    <div>
                      <h4 className="font-semibold mb-3 text-journey">ID Proof Required</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>Valid government ID required for all passengers</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>Aadhaar, PAN, Passport, or Driving License accepted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold text-journey mb-2">₹{busData.price}</div>
                <div className="text-sm text-muted-foreground">per seat</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Departure:</span>
                  <span className="font-semibold">{formatTime(busData.departure_time)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Arrival:</span>
                  <span className="font-semibold">{formatTime(busData.arrival_time)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span className="font-semibold">{calculateDuration(busData.departure_time, busData.arrival_time)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available Seats:</span>
                  <span className="font-semibold text-green-600">32 seats</span>
                </div>
              </div>

              <Button 
                variant="hero" 
                className="w-full mb-4"
                onClick={() => navigate(`/seat-selection/${busId}`)}
              >
                Select Seats
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                <Shield className="w-4 h-4 inline mr-1" />
                Safe & Secure Booking
              </div>

              {/* Quick Facts */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-3">Quick Facts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Live GPS Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free Cancellation*</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;