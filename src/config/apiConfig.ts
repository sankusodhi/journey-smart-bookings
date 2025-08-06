// API Configuration for Third-Party Bus Booking Services
// This file centralizes all API configurations and keys

export interface ApiConfig {
  abhibus: {
    enabled: boolean;
    apiKey: string | null;
    baseUrl: string;
  };
  redbus: {
    enabled: boolean;
    apiKey: string | null;
    baseUrl: string;
  };
  internal: {
    enabled: boolean;
  };
}

// API Configuration
export const apiConfig: ApiConfig = {
  // Abhibus Configuration
  abhibus: {
    enabled: false, // Set to true when API key is available
    apiKey: null, // Add your Abhibus API key here or via environment variable
    baseUrl: 'https://api.abhibus.com/v1',
  },

  // RedBus Configuration  
  redbus: {
    enabled: false, // Set to true when API key is available
    apiKey: null, // Add your RedBus API key here or via environment variable
    baseUrl: 'https://api.redbus.in/v1',
  },

  // Internal Supabase buses
  internal: {
    enabled: true, // Always enabled for internal buses
  },
};

// Environment variable mappings (for production)
if (typeof window !== 'undefined') {
  // Client-side environment variables (use with caution)
  apiConfig.abhibus.apiKey = (window as any).__ABHIBUS_API_KEY__ || null;
  apiConfig.redbus.apiKey = (window as any).__REDBUS_API_KEY__ || null;
} else {
  // Server-side environment variables (for SSR/Node.js)
  apiConfig.abhibus.apiKey = process.env.REACT_APP_ABHIBUS_API_KEY || null;
  apiConfig.redbus.apiKey = process.env.REACT_APP_REDBUS_API_KEY || null;
}

// Enable APIs only if keys are available
apiConfig.abhibus.enabled = !!apiConfig.abhibus.apiKey;
apiConfig.redbus.enabled = !!apiConfig.redbus.apiKey;

// Helper function to get available providers
export const getAvailableProviders = (): string[] => {
  const providers: string[] = [];
  
  if (apiConfig.abhibus.enabled) providers.push('abhibus');
  if (apiConfig.redbus.enabled) providers.push('redbus');
  if (apiConfig.internal.enabled) providers.push('internal');
  
  return providers;
};

// Helper function to check if any external APIs are available
export const hasExternalApis = (): boolean => {
  return apiConfig.abhibus.enabled || apiConfig.redbus.enabled;
};

// API rate limiting configuration
export const rateLimits = {
  abhibus: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },
  redbus: {
    requestsPerMinute: 100,
    requestsPerHour: 2000,
  },
};

// Mock data configuration
export const mockConfig = {
  enabled: true, // Always provide mock data as fallback
  delayMs: 1000, // Simulate network delay
  includeRandomErrors: false, // Set to true to test error handling
};