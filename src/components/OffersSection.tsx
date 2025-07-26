import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Gift, Percent, Clock, Tag } from "lucide-react";

const OffersSection = () => {
  const offers = [
    {
      id: 1,
      title: "First Trip Special",
      discount: "50% OFF",
      description: "Get flat 50% off on your first bus booking",
      code: "FIRST50",
      validTill: "31 Dec 2024",
      conditions: "Valid for new users only. Maximum discount ₹500",
      color: "bg-gradient-journey",
      icon: Gift
    },
    {
      id: 2,
      title: "Weekend Getaway",
      discount: "30% OFF",
      description: "Special weekend discounts for leisure travel",
      code: "WEEKEND30",
      validTill: "Every Weekend",
      conditions: "Valid on Fri-Sun bookings. Min booking ₹1000",
      color: "bg-gradient-trust",
      icon: Percent
    },
    {
      id: 3,
      title: "Early Bird Offer",
      discount: "25% OFF",
      description: "Book 7 days in advance and save big",
      code: "EARLY25",
      validTill: "Limited Time",
      conditions: "Book minimum 7 days in advance. Max discount ₹300",
      color: "bg-gradient-sunset",
      icon: Clock
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tag className="w-8 h-8 text-secondary" />
            <h2 className="text-4xl lg:text-5xl font-bold">
              Exclusive 
              <span className="bg-gradient-journey bg-clip-text text-transparent"> Offers</span>
            </h2>
          </div>
          <p className="text-xl text-muted-foreground">
            Save more on every journey with our amazing deals and offers
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {offers.map((offer) => (
            <div 
              key={offer.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 border border-border overflow-hidden"
            >
              {/* Offer Header */}
              <div className={`${offer.color} p-6 text-white relative`}>
                <div className="flex items-center justify-between mb-4">
                  <offer.icon className="w-8 h-8" />
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {offer.validTill}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                <div className="text-4xl font-bold">{offer.discount}</div>
              </div>

              {/* Offer Content */}
              <div className="p-6">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {offer.description}
                </p>
                
                {/* Offer Code */}
                <div className="bg-muted rounded-lg p-3 mb-4 flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{offer.code}</span>
                  <Button variant="outline" size="sm">
                    Copy Code
                  </Button>
                </div>

                {/* Conditions */}
                <div className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  *{offer.conditions}
                </div>

                <Button variant="hero" className="w-full">
                  Use This Offer
                </Button>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          ))}
        </div>

        {/* Special Conditions Banner */}
        <div className="bg-gradient-to-r from-muted/50 to-accent/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-foreground">
            🎯 Smart Offer Alert!
          </h3>
          <p className="text-lg text-muted-foreground mb-4">
            Our AI tracks the best deals for you. Some offers have smart conditions like 
            <span className="font-semibold text-primary"> "minimum 50 bookings in 3 hours" </span>
            to ensure fair usage! 😄
          </p>
          <Button variant="trust" size="lg">
            View All Offers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;