// store/authStore.ts - Fixed login function to properly handle planner profile
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Base user interface
interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'client' | 'planner' | 'admin';
  bio?: string;
  location?: string;
  profile_picture?: string;
  created_at?: string;
}

// Extended user with role-specific profiles
interface UserWithProfile extends User {
  plannerProfile?: {
    business_name: string;
    business_address?: string;
    business_email?: string;
    business_phone?: string;
    experience_years: number;
    status: 'pending' | 'approved' | 'rejected';
  };
  clientProfile?: {
    wedding_date?: string;
    wedding_location?: string;
  };
}

interface AuthState {
  user: UserWithProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: UserWithProfile) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: (navigate?: (path: string) => void) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (profileData: Partial<UserWithProfile>) => Promise<boolean>;
  
  // Computed properties
  getFullName: () => string;
  getInitials: () => string;
  isPlannerApproved: () => boolean;
  getPlannerStatus: () => string | null;
  getLogoutRedirectPath: () => string;
  getLogoutRedirectPathForRole: (role?: string) => string;
}

// Get API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Computed properties
      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        return `${user.first_name} ${user.last_name}`.trim();
      },

      getInitials: () => {
        const { user } = get();
        if (!user) return '';
        const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || '';
        const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || '';
        return firstInitial + lastInitial;
      },

      isPlannerApproved: () => {
        const { user } = get();
        return user?.role === 'planner' && user?.plannerProfile?.status === 'approved';
      },

      getPlannerStatus: () => {
        const { user } = get();
        return user?.plannerProfile?.status || null;
      },

      getLogoutRedirectPath: () => {
        const { user } = get();
        console.log('🔍 getLogoutRedirectPath - user:', user);
        console.log('🔍 getLogoutRedirectPath - user role:', user?.role);
        
        if (user?.role === 'client') {
          console.log('✅ Returning "/" for client');
          return '/';
        } else if (user?.role === 'admin' || user?.role === 'planner') {
          console.log('✅ Returning "/login" for admin/planner');
          return '/login';
        }
        console.log('⚠️ Fallback to "/" - no role match');
        return '/'; // fallback
      },

      // New method that takes role as parameter to avoid timing issues
      getLogoutRedirectPathForRole: (role?: string) => {
        console.log('🔍 getLogoutRedirectPathForRole - role:', role);
        
        if (role === 'client') {
          console.log('✅ Returning "/" for client');
          return '/';
        } else if (role === 'admin' || role === 'planner') {
          console.log('✅ Returning "/login" for admin/planner');
          return '/login';
        }
        console.log('⚠️ Fallback to "/" - no role match');
        return '/'; // fallback
      },

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔍 Starting login process for:', email);
          
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          console.log('📡 Login response status:', response.status);
          const data = await response.json();
          console.log('📋 Raw login response data:', JSON.stringify(data, null, 2));

          if (response.ok) {
            const userData = data.user || data;
            console.log('👤 Processing user data:', JSON.stringify(userData, null, 2));
            
            // Ensure we have the basic user data
            if (!userData.user_id || !userData.email || !userData.role) {
              console.error('❌ Incomplete user data received:', userData);
              set({ 
                error: 'Incomplete user data received from server', 
                isLoading: false 
              });
              return false;
            }
            
            const user: UserWithProfile = {
              user_id: userData.user_id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              bio: userData.bio,
              location: userData.location,
              profile_picture: userData.profile_picture,
              created_at: userData.created_at,
            };

            // Handle planner profile data specifically
            if (userData.role === 'planner') {
              console.log('🔍 Processing planner profile data...');
              console.log('📊 Planner profile from response:', JSON.stringify(userData.plannerProfile, null, 2));
              
              if (userData.plannerProfile) {
                user.plannerProfile = {
                  business_name: userData.plannerProfile.business_name || '',
                  business_address: userData.plannerProfile.business_address,
                  business_email: userData.plannerProfile.business_email,
                  business_phone: userData.plannerProfile.business_phone,
                  experience_years: userData.plannerProfile.experience_years || 0,
                  status: userData.plannerProfile.status || 'pending', // Ensure we have a status
                };
                
                console.log('✅ Planner profile set:', JSON.stringify(user.plannerProfile, null, 2));
                console.log('🎯 Planner status:', user.plannerProfile.status);
              } else {
                console.log('⚠️ No planner profile in response, setting default pending status');
                user.plannerProfile = {
                  business_name: '',
                  experience_years: 0,
                  status: 'pending',
                };
              }
            }

            // Handle client profile data
            if (userData.role === 'client' && userData.clientProfile) {
              user.clientProfile = {
                wedding_date: userData.clientProfile.wedding_date,
                wedding_location: userData.clientProfile.wedding_location,
              };
            }
            
            console.log('✅ Final user object created:', JSON.stringify(user, null, 2));
            console.log('🔍 User ID type:', typeof user.user_id);
            console.log('🎯 Final planner status check:', user.plannerProfile?.status);
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            
            // Verify the state was set correctly
            setTimeout(() => {
              const currentState = get();
              console.log('✅ Auth state after setting:', {
                isAuthenticated: currentState.isAuthenticated,
                userRole: currentState.user?.role,
                plannerStatus: currentState.user?.plannerProfile?.status
              });
            }, 100);
            
            return true;
          } else {
            console.log('❌ Login failed:', data.message);
            set({ 
              error: data.message || 'Login failed', 
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          console.error('💥 Login error:', error);
          const errorMessage = error.name === 'TypeError' && error.message.includes('fetch')
            ? 'Unable to connect to the server. Please check your internet connection.'
            : error.message || 'An unexpected error occurred';
            
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          return false;
        }
      },

      logout: async (navigate?: (path: string) => void) => {
        console.log('🔥 AuthStore logout called with navigate:', !!navigate);
        
        try {
          // Get current state BEFORE any changes
          const currentState = get();
          const currentUser = currentState.user;
          const currentUserRole = currentUser?.role;
          
          console.log('🔍 DEBUG - Full user object:', JSON.stringify(currentUser, null, 2));
          console.log('🔍 DEBUG - User role:', currentUserRole);
          console.log('🔍 DEBUG - User role type:', typeof currentUserRole);
          console.log('🔍 DEBUG - Is user object truthy:', !!currentUser);
          console.log('🔍 DEBUG - Current auth state:', currentState.isAuthenticated);
          
          // Calculate redirect path based on role
          let redirectPath = '/'; // Default fallback
          
          if (currentUserRole === 'client') {
            redirectPath = '/';
            console.log('✅ CLIENT detected - redirecting to "/"');
          } else if (currentUserRole === 'admin') {
            redirectPath = '/login';
            console.log('✅ ADMIN detected - redirecting to "/login"');
          } else if (currentUserRole === 'planner') {
            redirectPath = '/login';
            console.log('✅ PLANNER detected - redirecting to "/login"');
          } else {
            console.log('⚠️ UNKNOWN ROLE - using fallback redirect to "/"');
            redirectPath = '/';
          }
          
          console.log('🎯 FINAL redirect path decided:', redirectPath);
          
          // Set loading state
          set({ isLoading: true });
          
          // Make logout API call
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
          
          // Clear pending booking data on logout
          localStorage.removeItem('pendingBooking');
          console.log('🗑️ Cleared pending booking data on logout');
          
          // Clear user state AFTER we've decided the redirect path
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
          
          console.log('🚀 About to navigate to:', redirectPath);
          
          // Always use window.location for logout to avoid route guard interference
          console.log('🔍 Using window.location redirect to bypass route guards');
          window.location.href = redirectPath;
          
        } catch (error) {
          console.error('💥 AuthStore Logout error:', error);
          
          // Still clear the state and pending booking even if API call fails
          localStorage.removeItem('pendingBooking');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
          
          // Default to home page on error
          console.log('🚨 Error occurred - redirecting to home page');
          if (navigate) {
            navigate('/');
          } else {
            window.location.href = '/';
          }
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          console.log('🔍 Checking auth status...');
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include',
          });

          console.log('📡 Auth check response:', response.status);

          if (response.ok) {
            const userData = await response.json();
            console.log('✅ Auth check successful:', JSON.stringify(userData, null, 2));
            console.log('🔍 User ID from server:', userData.user_id, 'type:', typeof userData.user_id);
            
            const user: UserWithProfile = {
              user_id: userData.user_id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              bio: userData.bio,
              location: userData.location,
              profile_picture: userData.profile_picture,
              created_at: userData.created_at,
            };

            // Handle planner profile
            if (userData.role === 'planner' && userData.plannerProfile) {
              user.plannerProfile = {
                business_name: userData.plannerProfile.business_name || '',
                business_address: userData.plannerProfile.business_address,
                business_email: userData.plannerProfile.business_email,
                business_phone: userData.plannerProfile.business_phone,
                experience_years: userData.plannerProfile.experience_years || 0,
                status: userData.plannerProfile.status || 'pending',
              };
            }

            // Handle client profile
            if (userData.role === 'client' && userData.clientProfile) {
              user.clientProfile = {
                wedding_date: userData.clientProfile.wedding_date,
                wedding_location: userData.clientProfile.wedding_location,
              };
            }
            
            console.log('👤 Processed user object:', JSON.stringify(user, null, 2));
            console.log('🔍 Final user_id type:', typeof user.user_id);
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            const errorData = await response.json();
            console.log('❌ Auth check failed:', errorData);
            
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('💥 Auth check error:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      updateProfile: async (profileData: Partial<UserWithProfile>): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/users/profile/${user.user_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(profileData),
          });

          if (response.ok) {
            // Update local user data
            const updatedUser = { ...user, ...profileData };
            set({ 
              user: updatedUser, 
              isLoading: false 
            });
            return true;
          } else {
            const errorData = await response.json();
            set({ 
              error: errorData.message || 'Failed to update profile', 
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update profile', 
            isLoading: false 
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);