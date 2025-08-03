import { Button } from "./ui/button";
import { Search, User, Menu, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";
import WalletDisplay from "./WalletDisplay";

const Header = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                BusYatra
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Smart Bus Booking</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/search-results" className="text-foreground hover:text-primary transition-colors">Bus Tickets</a>
            <a href="/tracking" className="text-foreground hover:text-primary transition-colors">Track Bus</a>
            <a href="/#offers" className="text-foreground hover:text-primary transition-colors">Offers</a>
            <a href="/#features" className="text-foreground hover:text-primary transition-colors">Help</a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <WalletDisplay />
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex"
              onClick={handleAuthAction}
            >
              <User className="w-4 h-4 mr-2" />
              {user ? 'Logout' : 'Login/Signup'}
            </Button>
            <Button variant="hero" size="sm" className="hidden md:flex" onClick={() => window.location.href = '/search-results'}>
              Book Now
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
};

export default Header;