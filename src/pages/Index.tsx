import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import OffersSection from "@/components/OffersSection";
import LiveBusUpdates from "@/components/LiveBusUpdates";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <LiveBusUpdates />
      <FeaturesSection />
      <OffersSection />
      <Footer />
    </div>
  );
};

export default Index;
