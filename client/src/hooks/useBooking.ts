// hooks/useBooking.ts - Updated with payment support and statusCounts
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// UPDATED: Added payment interface
export interface Payment {
  payment_id: number;
  amount: number;
  receipt_url: string;
  uploaded_at: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  verified_by?: number;
}

export interface Booking {
  booking_id: number;
  package_id: number;
  wedding_date: string;
  wedding_time: string;
  wedding_location: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
  
  // Package details
  package_title: string;
  package_price: number;
  package_description: string;
  
  // Planner details
  planner_first_name: string;
  planner_last_name: string;
  business_name: string;
  
  // Client details
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string;
  
  // UPDATED: Added payment information
  payment?: Payment | null;
}

export interface BookingCategories {
  upcoming: Booking[];
  completed: Booking[];
  cancelled: Booking[];
}

export interface BookingFilters {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  search?: string;
  page?: number;
  limit?: number;
}

export interface StatusCounts {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface BookingResponse {
  bookings: BookingCategories;
  total: number;
  summary: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  statusCounts?: StatusCounts;
  pagination?: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateBookingData {
  packageId: number;
  weddingDate: string;
  weddingTime?: string;
  venue: string;
  specialRequests?: string;
  paymentMethod?: string;
  paymentAmount?: number;
  receiptFile?: File;
}

// Main hook for client bookings with filtering support
export const useClientBookings = (initialFilters?: BookingFilters) => {
  const [bookings, setBookings] = useState<BookingCategories>({
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [summary, setSummary] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const [pagination, setPagination] = useState<BookingResponse['pagination']>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFilters>(initialFilters || {});
  
  const { user, isAuthenticated } = useAuthStore();

  const fetchBookings = useCallback(async (newFilters?: BookingFilters) => {
    if (!isAuthenticated || user?.role !== 'client') {
      setError('Authentication required');
      return;
    }

    const currentFilters = newFilters || filters;
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (currentFilters.status) {
        params.append('status', currentFilters.status);
      }
      
      if (currentFilters.search && currentFilters.search.trim()) {
        params.append('search', currentFilters.search.trim());
      }
      
      if (currentFilters.page) {
        params.append('page', currentFilters.page.toString());
      }
      
      if (currentFilters.limit) {
        params.append('limit', currentFilters.limit.toString());
      }

      const queryString = params.toString();
      const url = `${API_BASE_URL}/bookings/my-bookings${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching bookings with URL:', url);
      console.log('Applied filters:', currentFilters);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data: BookingResponse = await response.json();
      
      console.log('Received booking data:', data);
      console.log('Status counts from backend:', data.statusCounts);
      
      // Use categorized data from backend
      setBookings(data.bookings || { upcoming: [], completed: [], cancelled: [] });
      setSummary(data.summary || { upcoming: 0, completed: 0, cancelled: 0 });
      
      // Ensure status counts are always set, even if undefined
      const receivedStatusCounts = data.statusCounts || { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
      console.log('Setting status counts:', receivedStatusCounts);
      setStatusCounts(receivedStatusCounts);
      
      setPagination(data.pagination);
      
      // Update current filters
      setFilters(currentFilters);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, filters]);

  // Function to update filters and fetch new data
  const updateFilters = useCallback((newFilters: Partial<BookingFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    fetchBookings(updatedFilters);
  }, [filters, fetchBookings]);

  // Function to clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = { page: 1, limit: 50 };
    fetchBookings(clearedFilters);
  }, [fetchBookings]);

  // Function to search bookings
  const searchBookings = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm, page: 1 });
  }, [updateFilters]);

  // Function to filter by status
  const filterByStatus = useCallback((status?: BookingFilters['status']) => {
    updateFilters({ status, page: 1 });
  }, [updateFilters]);

  // Function to change page
  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  // Initial load
  useEffect(() => {
    console.log('Initial useEffect triggered, authenticated:', isAuthenticated, 'role:', user?.role);
    if (isAuthenticated && user?.role === 'client') {
      console.log('Triggering initial fetchBookings...');
      fetchBookings();
    }
  }, [isAuthenticated, user?.role]);

  return {
    // Data
    bookings,
    summary,
    statusCounts,
    pagination,
    loading,
    error,
    filters,
    
    // Actions
    refetch: () => fetchBookings(),
    updateFilters,
    clearFilters,
    searchBookings,
    filterByStatus,
    changePage
  };
};

// Hook for creating bookings
export const useCreateBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const createBooking = async (bookingData: CreateBookingData) => {
    if (!isAuthenticated || user?.role !== 'client') {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('packageId', bookingData.packageId.toString());
      formData.append('weddingDate', bookingData.weddingDate);
      formData.append('venue', bookingData.venue);
      
      if (bookingData.weddingTime) {
        formData.append('weddingTime', bookingData.weddingTime);
      }
      
      if (bookingData.specialRequests) {
        formData.append('specialRequests', bookingData.specialRequests);
      }
      
      if (bookingData.paymentMethod) {
        formData.append('paymentMethod', bookingData.paymentMethod);
      }
      
      if (bookingData.paymentAmount) {
        formData.append('paymentAmount', bookingData.paymentAmount.toString());
      }
      
      if (bookingData.receiptFile) {
        formData.append('receiptFile', bookingData.receiptFile);
      }

      const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBooking,
    loading,
    error
  };
};

// Hook for booking details
export const useBookingDetails = (bookingId: string | number) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const fetchBookingDetails = async () => {
    if (!isAuthenticated || user?.role !== 'client' || !bookingId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/my-bookings/${bookingId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const data: Booking = await response.json();
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId && isAuthenticated && user?.role === 'client') {
      fetchBookingDetails();
    }
  }, [bookingId, isAuthenticated, user?.role]);

  return {
    booking,
    loading,
    error,
    refetch: fetchBookingDetails
  };
};

// Hook for canceling bookings
export const useCancelBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const cancelBooking = async (bookingId: string | number, reason?: string) => {
    if (!isAuthenticated || user?.role !== 'client') {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/my-bookings/${bookingId}/cancel`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    cancelBooking,
    loading,
    error
  };
};

// Hook for planner bookings (if needed)
export const usePlannerBookings = (plannerId?: string | number) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const fetchPlannerBookings = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'planner' || !plannerId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/planner/${plannerId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch planner bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch planner bookings');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, plannerId]);

  useEffect(() => {
    if (plannerId && isAuthenticated && user?.role === 'planner') {
      fetchPlannerBookings();
    }
  }, [plannerId, isAuthenticated, user?.role, fetchPlannerBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchPlannerBookings
  };
};

// Hook for updating booking status (planner/admin)
export const useUpdateBookingStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const updateStatus = async (
    bookingId: string | number, 
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
    notes?: string
  ) => {
    if (!isAuthenticated || (user?.role !== 'planner' && user?.role !== 'admin')) {
      throw new Error('Insufficient permissions');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update booking status');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStatus,
    loading,
    error
  };
};