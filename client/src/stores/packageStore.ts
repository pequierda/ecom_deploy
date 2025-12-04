// stores/packageStore.ts - Updated with preparation days logic
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  Package, 
  PackageResponse, 
  PackageStore, 
  PackageSearchParams, 
  PackageListResponse,
  DateAvailability,
  AvailabilityRangeResponse,
  UpcomingAvailabilityResponse,
  PreparationDaysInfo,
  PreparationPeriodCheck
} from '../types/package';

// Category interface
export interface Category {
  category_id: number;
  name: string;
  description?: string;
}

// Transform backend response to frontend format with preparation days
const transformPackageResponse = (response: PackageResponse): Package => {
  return {
    id: response.package_id,
    title: response.title,
    description: response.description,
    detailedDescription: response.detailed_description,
    price: `₱${response.price.toLocaleString()}`,
    numericPrice: response.price,
    rating: response.rating,
    reviewCount: response.review_count,
    defaultSlots: response.default_slots || 1,
    preparationDays: response.preparation_days || 0, // NEW: Include preparation days
    isActive: response.is_active,
    createdAt: response.created_at,

    category: {
      id: response.category_id,
      name: response.category_name,
      description: response.category_description,
    },

    planner: {
      id: response.planner_id,
      firstName: response.first_name,
      lastName: response.last_name,
      name: `${response.first_name} ${response.last_name}`,
      business_email: response.business_email,
      business_phone: response.business_phone,
      profilePicture: response.profile_picture,
      bio: response.bio,
      location: response.location,
      businessName: response.business_name,
      experienceYears: response.experience_years,
      status: response.planner_status,
      joinedDate: response.planner_joined,
      completedWeddings: response.completed_bookings,
      averageRating: response.avg_rating,
      totalReviews: response.total_reviews,
    },

    images: response.attachments
      .filter(att => att.file_type === 'image')
      .map(att => att.file_url),
    
    thumbnail: response.attachments
      .find(att => att.is_thumbnail)?.file_url || 
      response.attachments.find(att => att.file_type === 'image')?.file_url,

    inclusions: response.inclusions.map(inc => inc.inclusion_name),

    reviews: response.reviews ? response.reviews.map(review => ({
      id: review.feedback_id,
      rating: review.rating,
      comment: review.comment,
      author: review.client_first_name && review.client_last_name 
        ? `${review.client_first_name} ${review.client_last_name}`
        : 'Anonymous',
      weddingDate: review.wedding_date,
      date: new Date(review.created_at).toLocaleDateString(),
    })) : [],
  };
};

// Extended store interface with categories, availability, and preparation days
interface ExtendedPackageStore extends PackageStore {
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  fetchCategories: () => Promise<void>;
  setCurrentPackage: (packageData: Package) => void;
  
  // Existing availability functions
  fetchDateAvailability: (packageId: number, date: string) => Promise<DateAvailability>;
  fetchAvailabilityRange: (packageId: number, startDate: string, endDate: string) => Promise<Record<string, DateAvailability>>;
  
  // NEW: Preparation days functions
  fetchPreparationDays: (packageId: number) => Promise<PreparationDaysInfo>;
  checkPreparationPeriod: (packageId: number, date: string) => Promise<PreparationPeriodCheck>;
  fetchUpcomingAvailability: (packageId: number, daysAhead?: number, limit?: number) => Promise<UpcomingAvailabilityResponse>;
}

// API base URL - adjust this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const usePackageStore = create<ExtendedPackageStore>()(
  devtools(
    (set, get) => ({
      // State
      packages: [],
      currentPackage: null,
      loading: false,
      error: null,
      pagination: null,
      filters: {
        search: '',
        categories: [],
        planners: [],
        sortBy: 'created_at',
        sortOrder: 'DESC',
      },
      // Category state
      categories: [],
      categoriesLoading: false,
      categoriesError: null,

      // Actions
      fetchPackages: async (params?: PackageSearchParams) => {
        set({ loading: true, error: null });
        
        try {
          const queryParams = new URLSearchParams();
          
          if (params?.search) queryParams.append('search', params.search);
          if (params?.categories) queryParams.append('categories', params.categories);
          if (params?.planners) queryParams.append('planners', params.planners);
          if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
          if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
          if (params?.page) queryParams.append('page', params.page.toString());
          if (params?.limit) queryParams.append('limit', params.limit.toString());

          const response = await fetch(`${API_BASE_URL}/packages?${queryParams}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch packages: ${response.statusText}`);
          }

          const data: PackageResponse[] = await response.json();
          const transformedPackages = data.map(transformPackageResponse);

          set({ 
            packages: transformedPackages, 
            loading: false,
            error: null 
          });
        } catch (error) {
          console.error('Error fetching packages:', error);
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch packages' 
          });
        }
      },

      searchPackages: async (params: PackageSearchParams) => {
        set({ loading: true, error: null });
        
        try {
          const queryParams = new URLSearchParams();
          
          if (params.search) queryParams.append('search', params.search);
          if (params.categories) queryParams.append('categories', params.categories);
          if (params.planners) queryParams.append('planners', params.planners);
          if (params.sortBy) queryParams.append('sortBy', params.sortBy);
          if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());

          const response = await fetch(`${API_BASE_URL}/packages/search?${queryParams}`);
          
          if (!response.ok) {
            throw new Error(`Failed to search packages: ${response.statusText}`);
          }

          const data: PackageListResponse = await response.json();
          const transformedPackages = data.packages.map(transformPackageResponse);

          set({ 
            packages: transformedPackages,
            pagination: data.pagination,
            filters: {
              search: data.filters.search,
              categories: data.filters.categories,
              planners: data.filters.planners,
              sortBy: data.filters.sortBy,
              sortOrder: data.filters.sortOrder,
            },
            loading: false,
            error: null 
          });
        } catch (error) {
          console.error('Error searching packages:', error);
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to search packages' 
          });
        }
      },

      fetchPackageById: async (id: number) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/packages/${id}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Package not found');
            }
            throw new Error(`Failed to fetch package: ${response.statusText}`);
          }

          const data: PackageResponse = await response.json();
          const transformedPackage = transformPackageResponse(data);

          set({ 
            currentPackage: transformedPackage, 
            loading: false,
            error: null 
          });
        } catch (error) {
          console.error('Error fetching package:', error);
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch package',
            currentPackage: null 
          });
        }
      },

      // Existing availability functions
      fetchDateAvailability: async (packageId: number, date: string): Promise<DateAvailability> => {
        try {
          const response = await fetch(`${API_BASE_URL}/packages/${packageId}/availability/date?date=${date}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch date availability: ${response.statusText}`);
          }

          const data = await response.json();
          return data as DateAvailability;
        } catch (error) {
          console.error('Error fetching date availability:', error);
          throw error;
        }
      },

      fetchAvailabilityRange: async (packageId: number, startDate: string, endDate: string): Promise<Record<string, DateAvailability>> => {
        try {
          const response = await fetch(`${API_BASE_URL}/packages/${packageId}/availability/range?startDate=${startDate}&endDate=${endDate}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch availability range: ${response.statusText}`);
          }

          const data: AvailabilityRangeResponse = await response.json();
          return data.availability;
        } catch (error) {
          console.error('Error fetching availability range:', error);
          throw error;
        }
      },

      // NEW: Preparation days functions
      fetchPreparationDays: async (packageId: number): Promise<PreparationDaysInfo> => {
        try {
          const response = await fetch(`${API_BASE_URL}/packages/${packageId}/preparation-days`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch preparation days: ${response.statusText}`);
          }

          const data: PreparationDaysInfo = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching preparation days:', error);
          throw error;
        }
      },

      checkPreparationPeriod: async (packageId: number, date: string): Promise<PreparationPeriodCheck> => {
        try {
          const response = await fetch(`${API_BASE_URL}/packages/${packageId}/preparation-period?date=${date}`);
          
          if (!response.ok) {
            throw new Error(`Failed to check preparation period: ${response.statusText}`);
          }

          const data: PreparationPeriodCheck = await response.json();
          return data;
        } catch (error) {
          console.error('Error checking preparation period:', error);
          throw error;
        }
      },

      fetchUpcomingAvailability: async (packageId: number, daysAhead = 30, limit = 7): Promise<UpcomingAvailabilityResponse> => {
        try {
          const queryParams = new URLSearchParams({
            daysAhead: daysAhead.toString(),
            limit: limit.toString()
          });

          const response = await fetch(`${API_BASE_URL}/packages/${packageId}/upcoming-availability?${queryParams}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch upcoming availability: ${response.statusText}`);
          }

          const data: UpcomingAvailabilityResponse = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching upcoming availability:', error);
          throw error;
        }
      },

      // Fetch categories from API
      fetchCategories: async () => {
        set({ categoriesLoading: true, categoriesError: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/categories`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.statusText}`);
          }

          const categories: Category[] = await response.json();

          set({ 
            categories, 
            categoriesLoading: false,
            categoriesError: null 
          });
        } catch (error) {
          console.error('Error fetching categories:', error);
          set({ 
            categoriesLoading: false, 
            categoriesError: error instanceof Error ? error.message : 'Failed to fetch categories' 
          });
        }
      },

      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      setCurrentPackage: (packageData) => {
        set({ currentPackage: packageData });
      },

      clearCurrentPackage: () => {
        set({ currentPackage: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'package-store',
    }
  )
);

// Utility hooks for common operations
export const usePackages = () => {
  const packages = usePackageStore(state => state.packages);
  const loading = usePackageStore(state => state.loading);
  const error = usePackageStore(state => state.error);
  const pagination = usePackageStore(state => state.pagination);
  const fetchPackages = usePackageStore(state => state.fetchPackages);
  const searchPackages = usePackageStore(state => state.searchPackages);

  return { packages, loading, error, pagination, fetchPackages, searchPackages };
};

export const useCurrentPackage = () => {
  const currentPackage = usePackageStore(state => state.currentPackage);
  const loading = usePackageStore(state => state.loading);
  const error = usePackageStore(state => state.error);
  const fetchPackageById = usePackageStore(state => state.fetchPackageById);
  const clearCurrentPackage = usePackageStore(state => state.clearCurrentPackage);
  const setCurrentPackage = usePackageStore(state => state.setCurrentPackage);

  return { currentPackage, loading, error, fetchPackageById, clearCurrentPackage, setCurrentPackage };
};

export const usePackageFilters = () => {
  const filters = usePackageStore(state => state.filters);
  const setFilters = usePackageStore(state => state.setFilters);
  const searchPackages = usePackageStore(state => state.searchPackages);

  return { filters, setFilters, searchPackages };
};

export const useCategories = () => {
  const categories = usePackageStore(state => state.categories);
  const categoriesLoading = usePackageStore(state => state.categoriesLoading);
  const categoriesError = usePackageStore(state => state.categoriesError);
  const fetchCategories = usePackageStore(state => state.fetchCategories);

  return { categories, categoriesLoading, categoriesError, fetchCategories };
};

// Existing hook for availability
export const usePackageAvailability = () => {
  const fetchDateAvailability = usePackageStore(state => state.fetchDateAvailability);
  const fetchAvailabilityRange = usePackageStore(state => state.fetchAvailabilityRange);

  return { fetchDateAvailability, fetchAvailabilityRange };
};

// NEW: Hook for preparation days functionality
export const usePackagePreparationDays = () => {
  const fetchPreparationDays = usePackageStore(state => state.fetchPreparationDays);
  const checkPreparationPeriod = usePackageStore(state => state.checkPreparationPeriod);
  const fetchUpcomingAvailability = usePackageStore(state => state.fetchUpcomingAvailability);

  return { 
    fetchPreparationDays, 
    checkPreparationPeriod, 
    fetchUpcomingAvailability 
  };
};