// hooks/usePayments.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Payment {
  payment_id: number;
  booking_id: number;
  amount: number;
  receipt_url?: string;
  uploaded_at: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_by?: number;
  verified_at?: string;
  
  // Booking details
  wedding_date: string;
  wedding_location: string;
  booking_status: string;
  package_title: string;
  package_price: number;
  
  // Client details
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  
  // Planner details
  planner_first_name?: string;
  planner_last_name?: string;
  business_name: string;
  
  // Verified by details
  verified_by_first_name?: string;
  verified_by_last_name?: string;
}

export interface Invoice {
  booking_id: number;
  package_title: string;
  package_price: number;
  business_name: string;
  wedding_date: string;
  booking_status: string;
  payments: Payment[];
  total_paid: number;
  balance: number;
  invoice_status: 'pending' | 'partial' | 'paid';
}

export interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  verified_amount: number;
  pending_amount: number;
  total_invoices: number;
}

export interface InvoiceData {
  booking_id: number;
  wedding_date: string;
  wedding_time: string;
  wedding_location: string;
  booking_status: string;
  booking_created_at: string;
  package_title: string;
  package_price: number;
  package_description: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string;
  planner_first_name: string;
  planner_last_name: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  total_paid: number;
  payment_count: number;
  payments: Payment[];
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  balance: number;
  status: 'unpaid' | 'partial' | 'paid';
  verified_payments: Payment[];
}

export interface CreatePaymentData {
  bookingId: number;
  amount: number;
  receiptFile?: File;
}

// Hook for client payments
export const useClientPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    total_payments: 0,
    total_amount: 0,
    verified_amount: 0,
    pending_amount: 0,
    total_invoices: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'client') {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/my-payments`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      
      setPayments(data.payments || []);
      setInvoices(data.invoices || []);
      setSummary(data.summary || {
        total_payments: 0,
        total_amount: 0,
        verified_amount: 0,
        pending_amount: 0,
        total_invoices: 0
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'client') {
      fetchPayments();
    }
  }, [isAuthenticated, user?.role, fetchPayments]);

  return {
    payments,
    invoices,
    summary,
    loading,
    error,
    refetch: fetchPayments
  };
};

// Hook for creating payments
export const useCreatePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const createPayment = async (paymentData: CreatePaymentData) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('bookingId', paymentData.bookingId.toString());
      formData.append('amount', paymentData.amount.toString());
      
      if (paymentData.receiptFile) {
        formData.append('receiptFile', paymentData.receiptFile);
      }

      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    loading,
    error
  };
};

// Hook for generating invoice data
export const useInvoiceData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuthStore();

  const generateInvoice = async (bookingId: number): Promise<InvoiceData> => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/invoice/${bookingId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate invoice');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to generate invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateInvoice,
    loading,
    error
  };
};

// Hook for planner payments (if needed)
export const usePlannerPayments = (plannerId?: number) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated || (user?.role !== 'planner' && user?.role !== 'admin')) {
      setError('Authentication required');
      return;
    }

    const targetPlannerId = plannerId || user.user_id;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/planner/${targetPlannerId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch planner payments');
      }

      const data = await response.json();
      setPayments(data.payments || []);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch planner payments');
      console.error('Error fetching planner payments:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, user?.user_id, plannerId]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'planner' || user?.role === 'admin')) {
      fetchPayments();
    }
  }, [isAuthenticated, user?.role, fetchPayments]);

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments
  };
};

// Hook for verifying/rejecting payments (planner/admin only)
export const usePaymentActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  const verifyPayment = async (paymentId: number, notes?: string) => {
    if (!isAuthenticated || (user?.role !== 'planner' && user?.role !== 'admin')) {
      throw new Error('Insufficient permissions');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/verify`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify payment');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectPayment = async (paymentId: number, notes?: string) => {
    if (!isAuthenticated || (user?.role !== 'planner' && user?.role !== 'admin')) {
      throw new Error('Insufficient permissions');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/reject`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject payment');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to reject payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    verifyPayment,
    rejectPayment,
    loading,
    error
  };
};