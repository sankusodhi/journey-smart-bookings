import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Coins, Gift } from "lucide-react";
import { useEffect, useState } from "react";

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinsEarned: number;
  bookingDetails: {
    busName: string;
    route: string;
    seats: string[];
    amount: number;
  };
}

const CongratulationsModal = ({ 
  isOpen, 
  onClose, 
  coinsEarned, 
  bookingDetails 
}: CongratulationsModalProps) => {
  const [showCoins, setShowCoins] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowCoins(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <div className="text-center p-6">
          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-scale-in">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            
            {/* Coin Animation */}
            {showCoins && (
              <div className="absolute -top-2 -right-2 animate-fade-in">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
            )}
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Congratulations!
          </h2>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed successfully
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3 text-center">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bus:</span>
                <span className="font-medium">{bookingDetails.busName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">{bookingDetails.route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seats:</span>
                <span className="font-medium">{bookingDetails.seats.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₹{bookingDetails.amount}</span>
              </div>
            </div>
          </div>

          {/* Coin Reward */}
          {showCoins && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6 animate-fade-in">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-800">Reward Earned!</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-6 h-6 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-700">+{coinsEarned}</span>
                <span className="text-yellow-600">Coins</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Use coins for discounts on future bookings!
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            Continue Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CongratulationsModal;