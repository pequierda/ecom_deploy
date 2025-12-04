// config/api.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      REGISTER: '/users/register',
    },
    
    // User endpoints
    USERS: {
      PROFILE: (userId: number) => `/users/profile/${userId}`,
      LIST: '/users',
      DELETE: (userId: number) => `/users/${userId}`,
    },
    
    // Client endpoints
    CLIENTS: {
      LIST: (plannerId: number) => `/clients/${plannerId}`,
      STATS: (plannerId: number) => `/clients/${plannerId}/stats`,
      DETAILS: (plannerId: number, clientId: number) => `/clients/${plannerId}/client/${clientId}`,
      MESSAGE: (plannerId: number, clientId: number) => `/clients/${plannerId}/client/${clientId}/message`,
      NOTES: (plannerId: number, clientId: number) => `/clients/${plannerId}/client/${clientId}/notes`,
    },
    
    // Package endpoints
    PACKAGES: {
      LIST: '/packages',
      CREATE: '/packages',
      UPDATE: (packageId: number) => `/packages/${packageId}`,
      DELETE: (packageId: number) => `/packages/${packageId}`,
      BY_PLANNER: (plannerId: number) => `/packages/planner/${plannerId}`,
    },
    
    // Booking endpoints
    BOOKINGS: {
      LIST: '/bookings',
      CREATE: '/bookings',
      UPDATE: (bookingId: number) => `/bookings/${bookingId}`,
      DELETE: (bookingId: number) => `/bookings/${bookingId}`,
      BY_CLIENT: (clientId: number) => `/bookings/client/${clientId}`,
      BY_PLANNER: (plannerId: number) => `/bookings/planner/${plannerId}`,
    },
    
    // Category endpoints
    CATEGORIES: {
      LIST: '/categories',
      CREATE: '/categories',
      UPDATE: (categoryId: number) => `/categories/${categoryId}`,
      DELETE: (categoryId: number) => `/categories/${categoryId}`,
    },
    
    // Planner endpoints
    PLANNERS: {
      LIST: '/planners',
      PROFILE: (plannerId: number) => `/planners/${plannerId}`,
      UPDATE: (plannerId: number) => `/planners/${plannerId}`,
      APPROVE: (plannerId: number) => `/planners/${plannerId}/approve`,
      REJECT: (plannerId: number) => `/planners/${plannerId}/reject`,
    },
 REPORTS: {
      LIST: (plannerId: number) => `/reports/${plannerId}`,
      STATS: (plannerId: number) => `/reports/${plannerId}/stats`,
      REALTIME: (plannerId: number) => `/reports/${plannerId}/realtime`,
      DASHBOARD: (plannerId: number) => `/reports/${plannerId}/dashboard`,
      EXPORT: (plannerId: number) => `/reports/${plannerId}/export`,
    },
  },
};

// Helper function to build full URL
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Default fetch options
export const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

// API request wrapper with error handling
export const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = buildUrl(endpoint);
  const mergedOptions = {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof Error) {
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};