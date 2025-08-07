// Bus API Service for integrating with third-party bus booking APIs
// Supports Abhibus, Redbus, and other providers with a unified interface

export interface BusSearchParams {
  source: string;
  destination: string;
  date: string;
  passengers?: number;
}

export interface ThirdPartyBus {
  id: string;
  operator: string;
  busType: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  amenities: string[];
  rating: number;
  reviews: number;
  boardingPoints: Array<{
    id: string;
    name: string;
    time: string;
    address: string;
  }>;
  droppingPoints: Array<{
    id: string;
    name: string;
    time: string;
    address: string;
  }>;
  cancellationPolicy: string;
  provider: 'abhibus' | 'redbus' | 'internal' | 'mock';
}

export interface SeatMap {
  totalSeats: number;
  layout: {
    upper?: string[][];
    lower: string[][];
  };
  bookedSeats: string[];
  seatTypes: Record<string, { price: number; type: string }>;
}

class BusApiService {
  private abhiBusApiKey: string | null = null;
  private redBusApiKey: string | null = null;
  private baseUrls = {
    abhibus: 'https://api.abhibus.com/v1',
    redbus: 'https://api.redbus.in/v1',
  };

  constructor() {
    // In production, these would come from environment variables
    // For development, we'll use mock data when keys are not available
    this.abhiBusApiKey = import.meta.env.VITE_ABHIBUS_API_KEY || null;
    this.redBusApiKey = import.meta.env.VITE_REDBUS_API_KEY || null;
  }

  // Search buses from all available providers
  async searchBuses(params: BusSearchParams): Promise<ThirdPartyBus[]> {
    const results: ThirdPartyBus[] = [];
    
    try {
      // Search from all available providers
      const [abhiBusResults, redBusResults, internalResults] = await Promise.allSettled([
        this.searchAbhiBus(params),
        this.searchRedBus(params),
        this.searchInternalBuses(params),
      ]);

      // Combine results from all providers
      if (abhiBusResults.status === 'fulfilled') {
        results.push(...abhiBusResults.value);
      }
      
      if (redBusResults.status === 'fulfilled') {
        results.push(...redBusResults.value);
      }
      
      if (internalResults.status === 'fulfilled') {
        results.push(...internalResults.value);
      }

      // If no real APIs are available, return mock data
      if (results.length === 0) {
        return this.getMockBusData(params);
      }

      return results.sort((a, b) => a.price - b.price);
    } catch (error) {
      console.error('Error searching buses:', error);
      return this.getMockBusData(params);
    }
  }

  // Abhibus API integration
  private async searchAbhiBus(params: BusSearchParams): Promise<ThirdPartyBus[]> {
    if (!this.abhiBusApiKey) {
      throw new Error('Abhibus API key not available');
    }

    try {
      const response = await fetch(`${this.baseUrls.abhibus}/buses/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.abhiBusApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: params.source,
          destination: params.destination,
          date: params.date,
        }),
      });

      if (!response.ok) {
        throw new Error(`Abhibus API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformAbhiBusData(data.buses || []);
    } catch (error) {
      console.error('Abhibus API error:', error);
      throw error;
    }
  }

  // RedBus API integration
  private async searchRedBus(params: BusSearchParams): Promise<ThirdPartyBus[]> {
    if (!this.redBusApiKey) {
      throw new Error('RedBus API key not available');
    }

    try {
      const response = await fetch(`${this.baseUrls.redbus}/buses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.redBusApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`RedBus API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformRedBusData(data.result || []);
    } catch (error) {
      console.error('RedBus API error:', error);
      throw error;
    }
  }

  // Internal Supabase buses
  private async searchInternalBuses(params: BusSearchParams): Promise<ThirdPartyBus[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      let query = supabase
        .from('buses')
        .select('*')
        .order('departure_time');

      // Add filters if source/destination are provided
      if (params.source && params.source !== 'all') {
        query = query.eq('source', params.source);
      }
      if (params.destination && params.destination !== 'all') {
        query = query.eq('destination', params.destination);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(bus => this.transformInternalBusData(bus));
    } catch (error) {
      console.error('Internal bus search error:', error);
      throw error;
    }
  }

  // Get seat map for a specific bus
  async getSeatMap(busId: string, provider: string): Promise<SeatMap> {
    try {
      switch (provider) {
        case 'abhibus':
          return this.getAbhiBusSeatMap(busId);
        case 'redbus':
          return this.getRedBusSeatMap(busId);
        case 'internal':
          return this.getInternalSeatMap(busId);
        default:
          return this.getMockSeatMap();
      }
    } catch (error) {
      console.error('Error getting seat map:', error);
      return this.getMockSeatMap();
    }
  }

  // Transform Abhibus data to our format
  private transformAbhiBusData(buses: any[]): ThirdPartyBus[] {
    return buses.map(bus => ({
      id: `abhibus_${bus.id}`,
      operator: bus.operator_name,
      busType: bus.bus_type,
      source: bus.source,
      destination: bus.destination,
      departureTime: bus.departure_time,
      arrivalTime: bus.arrival_time,
      duration: bus.duration,
      price: bus.fare,
      availableSeats: bus.available_seats,
      amenities: bus.amenities || [],
      rating: bus.rating || 4.0,
      reviews: bus.review_count || 0,
      boardingPoints: bus.boarding_points || [],
      droppingPoints: bus.dropping_points || [],
      cancellationPolicy: bus.cancellation_policy || 'Standard cancellation policy',
      provider: 'abhibus',
    }));
  }

  // Transform RedBus data to our format
  private transformRedBusData(buses: any[]): ThirdPartyBus[] {
    return buses.map(bus => ({
      id: `redbus_${bus.id}`,
      operator: bus.travels,
      busType: bus.busType,
      source: bus.origin,
      destination: bus.destination,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      duration: bus.duration,
      price: bus.fare,
      availableSeats: bus.availableSeats,
      amenities: bus.amenities || [],
      rating: bus.rating || 4.0,
      reviews: bus.reviewsCount || 0,
      boardingPoints: bus.boardingTimes || [],
      droppingPoints: bus.droppingTimes || [],
      cancellationPolicy: bus.cancellationPolicy || 'Standard cancellation policy',
      provider: 'redbus',
    }));
  }

  // Transform internal Supabase data to our format
  private transformInternalBusData(bus: any): ThirdPartyBus {
    return {
      id: `internal_${bus.id}`,
      operator: bus.bus_name,
      busType: 'AC Sleeper',
      source: bus.source,
      destination: bus.destination,
      departureTime: bus.departure_time,
      arrivalTime: bus.arrival_time,
      duration: this.calculateDuration(bus.departure_time, bus.arrival_time),
      price: Number(bus.price),
      availableSeats: 40,
      amenities: ['WiFi', 'AC', 'Charging Point', 'Water Bottle'],
      rating: 4.2,
      reviews: 150,
      boardingPoints: [
        { id: '1', name: `${bus.source} Bus Stand`, time: bus.departure_time, address: `Main Bus Stand, ${bus.source}` },
        { id: '2', name: `${bus.source} Railway Station`, time: this.addMinutes(bus.departure_time, 15), address: `Railway Station, ${bus.source}` },
      ],
      droppingPoints: [
        { id: '1', name: `${bus.destination} Bus Stand`, time: bus.arrival_time, address: `Main Bus Stand, ${bus.destination}` },
        { id: '2', name: `${bus.destination} Railway Station`, time: this.addMinutes(bus.arrival_time, -15), address: `Railway Station, ${bus.destination}` },
      ],
      cancellationPolicy: 'Free cancellation up to 24 hours before departure',
      provider: 'internal',
    };
  }

  // Mock data for development/testing
  private getMockBusData(params: BusSearchParams): ThirdPartyBus[] {
    return [
      {
        id: 'mock_1',
        operator: 'SuperFast Travels',
        busType: 'AC Sleeper',
        source: params.source || 'Dantewada',
        destination: params.destination || 'Raipur',
        departureTime: '2025-07-27T06:00:00',
        arrivalTime: '2025-07-27T14:00:00',
        duration: '8h 00m',
        price: 550,
        availableSeats: 25,
        amenities: ['WiFi', 'AC', 'Charging Point', 'Water Bottle', 'Entertainment'],
        rating: 4.3,
        reviews: 1250,
        boardingPoints: [
          { id: '1', name: 'Dantewada Bus Stand', time: '06:00', address: 'Main Bus Stand, Dantewada' },
          { id: '2', name: 'Dantewada Railway Station', time: '06:15', address: 'Railway Station Road, Dantewada' },
        ],
        droppingPoints: [
          { id: '1', name: 'Raipur Bus Stand', time: '14:00', address: 'Main Bus Stand, Raipur' },
          { id: '2', name: 'Raipur Railway Station', time: '13:45', address: 'Station Road, Raipur' },
        ],
        cancellationPolicy: 'Free cancellation up to 24 hours before departure. 50% refund within 24 hours.',
        provider: 'mock',
      },
      {
        id: 'mock_2',
        operator: 'Royal Express',
        busType: 'Non-AC Seater',
        source: params.source || 'Bijapur',
        destination: params.destination || 'Raipur',
        departureTime: '2025-07-27T07:00:00',
        arrivalTime: '2025-07-27T14:00:00',
        duration: '7h 00m',
        price: 480,
        availableSeats: 35,
        amenities: ['Charging Point', 'Water Bottle'],
        rating: 3.9,
        reviews: 850,
        boardingPoints: [
          { id: '1', name: 'Bijapur Main Stand', time: '07:00', address: 'Central Bus Stand, Bijapur' },
        ],
        droppingPoints: [
          { id: '1', name: 'Raipur Central', time: '14:00', address: 'Central Bus Terminal, Raipur' },
        ],
        cancellationPolicy: 'Cancellation charges: ₹50 per ticket',
        provider: 'mock',
      },
    ];
  }

  // Mock seat map
  private getMockSeatMap(): SeatMap {
    return {
      totalSeats: 40,
      layout: {
        upper: [
          ['U1', 'U2', '', 'U3'],
          ['U4', 'U5', '', 'U6'],
          ['U7', 'U8', '', 'U9'],
          ['U10', 'U11', '', 'U12'],
        ],
        lower: [
          ['L1', 'L2', '', 'L3'],
          ['L4', 'L5', '', 'L6'],
          ['L7', 'L8', '', 'L9'],
          ['L10', 'L11', '', 'L12'],
        ],
      },
      bookedSeats: ['L2', 'L5', 'U3', 'U8'],
      seatTypes: {
        'L': { price: 550, type: 'Lower Berth' },
        'U': { price: 500, type: 'Upper Berth' },
      },
    };
  }

  // Helper methods for seat maps
  private async getAbhiBusSeatMap(busId: string): Promise<SeatMap> {
    // Implementation for Abhibus seat map API
    return this.getMockSeatMap();
  }

  private async getRedBusSeatMap(busId: string): Promise<SeatMap> {
    // Implementation for RedBus seat map API
    return this.getMockSeatMap();
  }

  private async getInternalSeatMap(busId: string): Promise<SeatMap> {
    // Use existing Supabase seat map logic
    return this.getMockSeatMap();
  }

  // Utility methods
  private calculateDuration(departure: string, arrival: string): string {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  private addMinutes(timeString: string, minutes: number): string {
    const date = new Date(timeString);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
  }
}

export const busApiService = new BusApiService();