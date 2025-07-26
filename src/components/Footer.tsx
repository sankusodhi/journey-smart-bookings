import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-trust via-primary to-trust text-white">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-journey rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-trust" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">BusYatra</h3>
                <p className="text-sm text-white/80">Smart Bus Booking</p>
              </div>
            </div>
            <p className="text-white/90 leading-relaxed">
              India's most trusted bus booking platform with real-time tracking, 
              instant booking, and best prices guaranteed.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Book Bus Tickets</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Cancel Ticket</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Track Bus</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Print Ticket</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Offers</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Help & Support</a></li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Popular Routes</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Delhi to Mumbai</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Bangalore to Chennai</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Pune to Goa</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Hyderabad to Vijayawada</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Kolkata to Bhubaneswar</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Ahmedabad to Surat</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-journey" />
                <div>
                  <p className="text-white">24/7 Support</p>
                  <p className="text-white/80">1800-XXX-XXXX</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-journey" />
                <div>
                  <p className="text-white">Email Us</p>
                  <p className="text-white/80">support@busyatra.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-journey mt-1" />
                <div>
                  <p className="text-white">Head Office</p>
                  <p className="text-white/80">123 Business District, Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/80 text-sm">
              © 2024 BusYatra. All rights reserved. | Terms & Conditions | Privacy Policy
            </p>
            <div className="flex items-center space-x-6 text-sm text-white/80">
              <span>🏆 India's #1 Bus Booking Platform</span>
              <span>🛡️ 100% Secure Payments</span>
              <span>🚌 25L+ Happy Travelers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;