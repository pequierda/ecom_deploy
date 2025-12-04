// hooks/usePlannerStats.js
import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const usePlannerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  const fetchPlannerStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/stats/planner`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch planner stats');
      }
    } catch (err) {
      console.error('Error fetching planner stats:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'planner') {
      fetchPlannerStats();
    }
  }, [isAuthenticated, user?.role]);

  const refetch = () => {
    fetchPlannerStats();
  };

  return {
    stats,
    loading,
    error,
    refetch
  };
};