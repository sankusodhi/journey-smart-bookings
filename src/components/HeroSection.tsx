import { Button } from "./ui/button";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import { Input } from "./ui/input";
import heroImage from "@/assets/hero-bus.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Text */}
          <div className="text-white space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                India's
                <span className="block bg-gradient-journey bg-clip-text text-transparent">
                  Smartest
                </span>
                Bus Booking
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 max-w-lg">
                Book bus tickets with real-time tracking, best prices, and instant confirmation. 
                Travel smart, travel with BusYatra!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="journey" size="lg" className="text-lg px-8 py-4" onClick={() => window.location.href = '/search-results'}>
                <Search className="w-5 h-5 mr-2" />
                Search Buses
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => window.location.href = '/tracking'}>
                Track My Bus
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-journey">25L+</div>
                <div className="text-sm text-white/80">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-journey">50K+</div>
                <div className="text-sm text-white/80">Routes Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-journey">99.9%</div>
                <div className="text-sm text-white/80">On-Time Performance</div>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="lg:max-w-md mx-auto w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-glow p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Book Your Journey</h2>
                <p className="text-muted-foreground">Find and book bus tickets instantly</p>
              </div>

              <div className="space-y-4">
                {/* From & To */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">From</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Delhi" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">To</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Mumbai" className="pl-10" />
                    </div>
                  </div>
                </div>

                {/* Date & Passengers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input type="date" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Passengers</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="1" className="pl-10" />
                    </div>
                  </div>
                </div>

                <Button variant="hero" size="lg" className="w-full text-lg py-4" onClick={() => window.location.href = '/search-results'}>
                  <Search className="w-5 h-5 mr-2" />
                  Search Buses
                </Button>
              </div>

              {/* Quick Links */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Popular Routes:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Delhi → Mumbai</Button>
                  <Button variant="outline" size="sm">Bangalore → Chennai</Button>
                  <Button variant="outline" size="sm">Pune → Goa</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bus Animation */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-20">
        <div className="text-6xl animate-float">🚌</div>
      </div>
    </section>
  );
};

export default HeroSection;