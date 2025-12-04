// stores/plannerStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export interface PlannerReview {
  feedback_id: number;
  rating: number;
  comment: string;
  wedding_date: string;
  created_at: string;
  client_first_name?: string;
  client_last_name?: string;
  package_name?: string;
}

export interface PlannerResponse {
  // User fields
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_picture: string;
  location: string;
  
  // Planner-specific fields
  planner_id: number;
  business_name: string;
  business_email: string;
  business_phone: string;
  bio: string;
  experience_years: number;
  status: 'pending' | 'approved' | 'rejected';
  joined_date: string;
  
  // Aggregated stats
  completed_weddings: number;
  average_rating: number;
  total_reviews: number;
  
  // Reviews (only included in detailed view)
  reviews?: PlannerReview[];
}

export interface Planner {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  location: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  bio: string;
  experienceYears: number;
  status: 'pending' | 'approved' | 'rejected';
  joinedDate: string;
  completedWeddings: number;
  averageRating: number;
  totalReviews: number;
  reviews: {
    id: number;
    rating: number;
    comment: string;
    author: string;
    weddingDate: string;
    date: string;
    packageName?: string;
  }[];
}

// Store state
export interface PlannerState {
  currentPlanner: Planner | null;
  plannerReviews: PlannerReview[];
  loading: boolean;
  error: string | null;
  reviewsLoading: boolean;
  reviewsError: string | null;
}

// Actions
export interface PlannerActions {
  fetchPlannerById: (id: number) => Promise<void>;
  fetchPlannerReviews: (id: number) => Promise<PlannerReview[]>;
  clearCurrentPlanner: () => void;
  clearError: () => void;
}

export type PlannerStore = PlannerState & PlannerActions;

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Transform backend response to frontend format
const transformPlannerResponse = (response: PlannerResponse): Planner => {
  return {
    id: response.planner_id,
    firstName: response.first_name,
    lastName: response.last_name,
    name: `${response.first_name} ${response.last_name}`,
    email: response.email,
    phone: response.phone,
    profilePicture: response.profile_picture,
    location: response.location,
    businessName: response.business_name,
    businessEmail: response.business_email,
    businessPhone: response.business_phone,
    bio: response.bio,
    experienceYears: response.experience_years,
    status: response.status,
    joinedDate: response.joined_date,
    completedWeddings: response.completed_weddings,
    averageRating: response.average_rating,
    totalReviews: response.total_reviews,
    reviews: response.reviews ? response.reviews.map(review => ({
      id: review.feedback_id,
      rating: review.rating,
      comment: review.comment,
      author: review.client_first_name && review.client_last_name 
        ? `${review.client_first_name} ${review.client_last_name}`
        : 'Anonymous',
      weddingDate: review.wedding_date,
      date: new Date(review.created_at).toLocaleDateString(),
      packageName: review.package_name,
    })) : [],
  };
};

export const usePlannerStore = create<PlannerStore>()(
  devtools(
    (set, get) => ({
      // State
      currentPlanner: null,
      plannerReviews: [],
      loading: false,
      error: null,
      reviewsLoading: false,
      reviewsError: null,

      // Actions
      fetchPlannerById: async (id: number) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/planners/${id}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Planner not found');
            }
            throw new Error(`Failed to fetch planner: ${response.statusText}`);
          }

          const data: PlannerResponse = await response.json();
          const transformedPlanner = transformPlannerResponse(data);

          set({ 
            currentPlanner: transformedPlanner, 
            loading: false,
            error: null 
          });
        } catch (error) {
          console.error('Error fetching planner:', error);
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch planner',
            currentPlanner: null 
          });
        }
      },

      fetchPlannerReviews: async (id: number): Promise<PlannerReview[]> => {
        set({ reviewsLoading: true, reviewsError: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/planners/${id}/reviews`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch planner reviews: ${response.statusText}`);
          }

          const reviews: PlannerReview[] = await response.json();

          set({ 
            plannerReviews: reviews,
            reviewsLoading: false,
            reviewsError: null 
          });

          return reviews;
        } catch (error) {
          console.error('Error fetching planner reviews:', error);
          set({ 
            reviewsLoading: false, 
            reviewsError: error instanceof Error ? error.message : 'Failed to fetch planner reviews' 
          });
          throw error;
        }
      },

      clearCurrentPlanner: () => {
        set({ currentPlanner: null, error: null });
      },

      clearError: () => {
        set({ error: null, reviewsError: null });
      },
    }),
    {
      name: 'planner-store',
    }
  )
);

// Utility hooks for common operations
export const useCurrentPlanner = () => {
  const currentPlanner = usePlannerStore(state => state.currentPlanner);
  const loading = usePlannerStore(state => state.loading);
  const error = usePlannerStore(state => state.error);
  const fetchPlannerById = usePlannerStore(state => state.fetchPlannerById);
  const clearCurrentPlanner = usePlannerStore(state => state.clearCurrentPlanner);

  return { currentPlanner, loading, error, fetchPlannerById, clearCurrentPlanner };
};

export const usePlannerReviews = () => {
  const plannerReviews = usePlannerStore(state => state.plannerReviews);
  const reviewsLoading = usePlannerStore(state => state.reviewsLoading);
  const reviewsError = usePlannerStore(state => state.reviewsError);
  const fetchPlannerReviews = usePlannerStore(state => state.fetchPlannerReviews);

  return { plannerReviews, reviewsLoading, reviewsError, fetchPlannerReviews };
};