import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BusSearchFormProps {
  onSearch?: (params: {
    source: string;
    destination: string;
    date: string;
    passengers: number;
  }) => void;
}

const BusSearchForm = ({ onSearch }: BusSearchFormProps) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    source: "",
    destination: "",
    date: new Date().toISOString().split('T')[0],
    passengers: 1,
  });
  const [loading, setLoading] = useState(false);

  const popularRoutes = [
    { from: "Dantewada", to: "Raipur" },
    { from: "Bijapur", to: "Raipur" },
    { from: "Geedam", to: "Bilaspur" },
    { from: "Bhopalpatnam", to: "Bilaspur" },
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    if (!searchData.source || !searchData.destination) {
      toast.error("Please select both source and destination");
      return;
    }

    if (searchData.source === searchData.destination) {
      toast.error("Source and destination cannot be the same");
      return;
    }

    setLoading(true);
    
    try {
      // Call the onSearch callback if provided
      if (onSearch) {
        onSearch(searchData);
      }
      
      // Navigate to search results with parameters
      const searchParams = new URLSearchParams({
        source: searchData.source,
        destination: searchData.destination,
        date: searchData.date,
        passengers: searchData.passengers.toString(),
      });
      
      navigate(`/search-results?${searchParams.toString()}`);
      
      toast.success("Searching for buses...");
    } catch (error) {
      toast.error("Failed to search buses. Please try again.");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteClick = (route: { from: string; to: string }) => {
    setSearchData(prev => ({
      ...prev,
      source: route.from,
      destination: route.to,
    }));
  };

  const swapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      source: prev.destination,
      destination: prev.source,
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-6 shadow-elegant bg-card/95 backdrop-blur-sm border border-border/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              From
            </Label>
            <Input
              id="source"
              placeholder="Source city"
              value={searchData.source}
              onChange={(e) => handleInputChange("source", e.target.value)}
              className="h-12"
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              To
            </Label>
            <div className="relative">
              <Input
                id="destination"
                placeholder="Destination city"
                value={searchData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                className="h-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-8 w-8"
                onClick={swapLocations}
                title="Swap locations"
              >
                ⇄
              </Button>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={searchData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="h-12"
            />
          </div>

          {/* Passengers */}
          <div className="space-y-2">
            <Label htmlFor="passengers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Passengers
            </Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              max="6"
              value={searchData.passengers}
              onChange={(e) => handleInputChange("passengers", parseInt(e.target.value) || 1)}
              className="h-12"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 h-10 text-base font-semibold bg-gradient-primary hover:opacity-90 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search Buses
              </>
            )}
          </Button>
        </div>

        {/* Popular Routes */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Routes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {popularRoutes.map((route, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3"
                onClick={() => handleRouteClick(route)}
              >
                {route.from} → {route.to}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BusSearchForm;