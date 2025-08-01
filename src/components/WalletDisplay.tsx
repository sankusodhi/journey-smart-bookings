import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const WalletDisplay = () => {
  const { user, coins } = useAuth();

  if (!user) return null;

  return (
    <Badge variant="outline" className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300">
      <Coins className="w-4 h-4 mr-1 text-yellow-600" />
      {coins} Coins
    </Badge>
  );
};

export default WalletDisplay;