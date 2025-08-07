import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityOption {
  id: string;
  name: string;
  fullName: string;
  state?: string;
  country?: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", 
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", 
  "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", 
  "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar", 
  "Varanasi", "Srinagar", "Dhanbad", "Jodhpur", "Amritsar", "Raipur", "Allahabad", 
  "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Madurai", "Guwahati", "Chandigarh", 
  "Hubli-Dharwad", "Amroha", "Moradabad", "Gurgaon", "Aligarh", "Solapur", "Ranchi", 
  "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Warangal", "Mira-Bhayandar", 
  "Thiruvananthapuram", "Bhiwandi", "Saharanpur", "Gorakhpur", "Guntur", "Bikaner", 
  "Amravati", "Noida", "Jamshedpur", "Bhilai Nagar", "Cuttack", "Firozabad", "Kochi", 
  "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded", 
  "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", 
  "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", 
  "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur", 
  "Maheshtala", "Dantewada", "Bijapur", "Geedam", "Bhopalpatnam", "Bilaspur"
];

export function CityAutocomplete({ value, onChange, placeholder, className, id }: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSuggestions = async (query: string): Promise<CityOption[]> => {
    if (query.length < 2) return [];

    // First, filter from our Indian cities list
    const localSuggestions = INDIAN_CITIES
      .filter(city => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(city => ({
        id: city.toLowerCase().replace(/\s+/g, '-'),
        name: city,
        fullName: `${city}, India`,
        country: 'India'
      }));

    // If we have good local matches, return them
    if (localSuggestions.length >= 3) {
      return localSuggestions;
    }

    // Otherwise, try to fetch from Mapbox (fallback to local if API fails)
    try {
      setLoading(true);
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('geocode', {
        body: { q: query, country: 'IN' }
      });
      
      if (error || !data) {
        return localSuggestions;
      }

      const mapboxSuggestions = data.features?.map((feature: any) => ({
        id: feature.id,
        name: feature.text,
        fullName: feature.place_name,
        state: feature.context?.find((c: any) => c.id.includes('region'))?.text,
        country: feature.context?.find((c: any) => c.id.includes('country'))?.text
      })) || [];

      // Combine and deduplicate
      const combined = [...localSuggestions, ...mapboxSuggestions];
      const unique = combined.filter((item, index, self) => 
        index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
      );

      return unique.slice(0, 8);
    } catch (error) {
      console.error('Geocoding error:', error);
      return localSuggestions;
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim()) {
      const results = await getSuggestions(newValue);
      setSuggestions(results);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: CityOption) => {
    onChange(suggestion.name);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleFocus = async () => {
    if (value.trim()) {
      const results = await getSuggestions(value);
      setSuggestions(results);
      setIsOpen(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
      }
    }, 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        dropdownRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn("h-11 bg-background border-border pr-10", className)}
          autoComplete="off"
        />
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {isOpen && (suggestions.length > 0 || loading) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading && (
            <div className="flex items-center justify-center p-3">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Searching cities...</span>
            </div>
          )}
          
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.id}
              variant="ghost"
              className="w-full justify-start h-auto p-3 text-left hover:bg-muted/50"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {suggestion.name}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {suggestion.state && `${suggestion.state}, `}{suggestion.country}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
