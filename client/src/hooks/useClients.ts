// hooks/useClients.ts - Updated to use authStore
import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../services/clientService';
import type{ Client, ClientFilters, ClientStats, Pagination } from '../services/clientService';
import { useAuthStore } from '../stores/authStore';

export const useClients = (filters: ClientFilters = {}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  const fetchClients = useCallback(async () => {
    // Check if user is authenticated and is a planner
    if (!isAuthenticated || !user || user.role !== 'planner') {
      setLoading(false);
      setError('Access denied. Only planners can view client data.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await clientService.getPlannerClients(user.user_id, filters);
      
      if (response.success) {
        setClients(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError('Failed to fetch clients');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, filters]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const refetch = useCallback(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    pagination,
    refetch
  };
};

export const useClientStats = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    activeProjects: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    // Check if user is authenticated and is a planner
    if (!isAuthenticated || !user || user.role !== 'planner') {
      setLoading(false);
      setError('Access denied. Only planners can view statistics.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await clientService.getClientStats(user.user_id);
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
};

export const useClientActions = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (clientId: number, messageData: { message: string; subject?: string }) => {
    if (!isAuthenticated || !user || user.role !== 'planner') {
      throw new Error('Access denied. Only planners can send messages.');
    }

    setLoading(true);
    try {
      const response = await clientService.sendMessage(user.user_id, clientId, messageData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to send message');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const updateNotes = useCallback(async (clientId: number, notes: string) => {
    if (!isAuthenticated || !user || user.role !== 'planner') {
      throw new Error('Access denied. Only planners can update notes.');
    }

    setLoading(true);
    try {
      const response = await clientService.updateClientNotes(user.user_id, clientId, notes);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update notes');
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const getClientDetails = useCallback(async (clientId: number) => {
    if (!isAuthenticated || !user || user.role !== 'planner') {
      throw new Error('Access denied. Only planners can view client details.');
    }

    setLoading(true);
    try {
      const response = await clientService.getClientDetails(user.user_id, clientId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch client details');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching client details:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  return {
    sendMessage,
    updateNotes,
    getClientDetails,
    loading
  };
};

// Hook for checking planner permissions
export const usePlannerPermissions = () => {
  const { user, isAuthenticated } = useAuthStore();

  const canAccessClients = user?.role === 'planner' && isAuthenticated;
  const canSendMessages = user?.role === 'planner' && isAuthenticated;
  const canUpdateNotes = user?.role === 'planner' && isAuthenticated;
  const isPlannerApproved = user?.role === 'planner' && 
                           user?.plannerProfile?.status === 'approved';

  return {
    canAccessClients,
    canSendMessages,
    canUpdateNotes,
    isPlannerApproved,
    plannerStatus: user?.plannerProfile?.status || null,
    businessName: user?.plannerProfile?.business_name || '',
  };
};