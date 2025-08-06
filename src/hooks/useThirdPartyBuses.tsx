import { useState, useEffect } from 'react';
import { busApiService, type ThirdPartyBus, type BusSearchParams } from '@/services/busApiService';

export interface UseBusSearchReturn {
  buses: ThirdPartyBus[];
  loading: boolean;
  error: string | null;
  searchBuses: (params: BusSearchParams) => Promise<void>;
  refreshBuses: () => Promise<void>;
}

export const useThirdPartyBuses = (initialParams?: BusSearchParams): UseBusSearchReturn => {
  const [buses, setBuses] = useState<ThirdPartyBus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<BusSearchParams | null>(initialParams || null);

  const searchBuses = async (params: BusSearchParams) => {
    setLoading(true);
    setError(null);
    setCurrentParams(params);

    try {
      const results = await busApiService.searchBuses(params);
      setBuses(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search buses';
      setError(errorMessage);
      console.error('Bus search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshBuses = async () => {
    if (currentParams) {
      await searchBuses(currentParams);
    }
  };

  // Initial search if params are provided
  useEffect(() => {
    if (initialParams) {
      searchBuses(initialParams);
    }
  }, []);

  return {
    buses,
    loading,
    error,
    searchBuses,
    refreshBuses,
  };
};