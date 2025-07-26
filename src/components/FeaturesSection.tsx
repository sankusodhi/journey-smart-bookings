import { Button } from "./ui/button";
import { MapPin, Clock, Shield, Smartphone, Star, CreditCard } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Track your bus live with GPS and get accurate arrival times",
      color: "text-primary"
    },
    {
      icon: Clock,
      title: "Instant Booking",
      description: "Book tickets in under 30 seconds with instant confirmation",
      color: "text-secondary"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your money and data are protected with bank-level security",
      color: "text-accent"
    },
    {
      icon: Smartphone,
      title: "Smart Notifications",
      description: "Get real-time updates about your journey on WhatsApp & SMS",
      color: "text-journey"
    },
    {
      icon: Star,
      title: "Best Prices",
      description: "Compare prices across operators and get the best deals",
      color: "text-trust"
    },
    {
      icon: CreditCard,
      title: "Easy Payments",
      description: "Multiple payment options with instant refunds",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Why Choose 
            <span className="bg-gradient-hero bg-clip-text text-transparent"> BusYatra?</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Experience the future of bus travel with our advanced features designed for modern travelers
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 border border-border"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-background flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-hero rounded-3xl p-12 text-white">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready for Your Next Journey?
            </h3>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join millions of satisfied travelers who trust BusYatra for their bus bookings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="journey" size="lg" className="text-lg px-8 py-4">
                Book Your First Trip
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Download App
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;