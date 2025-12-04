// types/package.ts - Updated with preparation days logic

export interface PaymentInfo {
  gcash: {
    number: string;
    qrCodeUrl: string;
    accountName: string;
  };
  maya: {
    number: string;
    qrCodeUrl: string;
    accountName: string;
  };
  bankTransfer: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

// This would typically be part of a planner's profile
export interface PlannerPaymentInfo {
  planner_id: number;
  payment_methods: PaymentInfo;
  created_at: string;
  updated_at: string;
}

export interface PackageInclusion {
  inclusion_id: number;
  inclusion_name: string;
}

export interface PackageAttachment {
  attachment_id: number;
  file_url: string;
  file_type: string;
  is_thumbnail: boolean;
  uploaded_at: string;
}

export interface PackageReview {
  feedback_id: number;
  rating: number;
  comment: string;
  wedding_date: string;
  created_at: string;
  // Client info (from joined tables)
  client_first_name?: string;
  client_last_name?: string;
}

// Updated to match new schema structure with preparation days
export interface PackageResponse {
  // Package fields
  package_id: number;
  title: string;
  description: string;
  detailed_description: string;
  price: number;
  rating: number;
  review_count: number;
  default_slots: number; // Updated from total_slots/used_slots
  preparation_days: number; // NEW: Preparation days field
  is_active: boolean;
  created_at: string;

  // Category fields (joined)
  category_id: number;
  category_name: string;
  category_description: string;

  // Planner fields (joined from users + planners tables)
  planner_id: number;
  first_name: string;
  last_name: string;
  business_email: string;
  business_phone: string;
  profile_picture: string;
  bio: string;
  location: string;
  business_name: string;
  experience_years: number;
  planner_status: 'pending' | 'approved' | 'rejected';
  planner_joined: string;

  // Aggregated stats
  completed_bookings: number;
  avg_rating: number;
  total_reviews: number;

  // Related data
  inclusions: PackageInclusion[];
  attachments: PackageAttachment[];
  reviews?: PackageReview[]; // Only included in detailed view
}

// Updated availability types for date-specific checking with preparation days
export interface DateAvailability {
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  available: boolean;
  isBlocked: boolean;
  isPreparationPeriod: boolean; // NEW: Indicates if blocked due to preparation period
  reason?: string;
}

export interface AvailabilityRangeResponse {
  packageId: number;
  startDate: string;
  endDate: string;
  availability: Record<string, DateAvailability>;
}

// NEW: Upcoming availability response with preparation days info
export interface UpcomingAvailabilityResponse {
  packageId: number;
  preparationDays: number;
  upcomingDates: Array<{
    date: string;
    availability: DateAvailability;
  }>;
  daysAhead: number;
  limit: number;
}

// NEW: Preparation days specific types
export interface PreparationDaysInfo {
  packageId: number;
  preparationDays: number;
}

export interface PreparationPeriodCheck {
  packageId: number;
  date: string;
  isInPreparationPeriod: boolean;
  preparationDays: number;
  reason?: string;
}

// Transformed structure for frontend use with preparation days
export interface Package {
  id: number;
  title: string;
  description: string;
  detailedDescription: string;
  price: string; // Formatted price string
  numericPrice: number;
  rating: number;
  reviewCount: number;
  defaultSlots: number; // Updated from totalSlots/usedSlots
  preparationDays: number; // NEW: Preparation days
  isActive: boolean;
  createdAt: string;

  category: {
    id: number;
    name: string;
    description: string;
  };

  planner: {
    id: number;
    firstName: string;
    lastName: string;
    name: string; 
    business_email: string;
    business_phone: string;
    profilePicture: string;
    bio: string;
    location: string;
    businessName: string;
    experienceYears: number;
    status: 'pending' | 'approved' | 'rejected';
    joinedDate: string;
    completedWeddings: number;
    averageRating: number;
    totalReviews: number;
  };

  images: string[]; // Transformed from attachments
  thumbnail?: string; // First thumbnail from attachments
  inclusions: string[]; // Simplified to just strings
  reviews: {
    id: number;
    rating: number;
    comment: string;
    author: string;
    weddingDate: string;
    date: string;
  }[];
}

// API Response types
export interface PackageListResponse {
  packages: PackageResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string;
    categories: number[];
    planners: number[];
    sortBy: string;
    sortOrder: string;
  };
}

export interface PackageSearchParams {
  search?: string;
  categories?: string;
  planners?: string;
  sortBy?: 'created_at' | 'price_low' | 'price_high' | 'rating' | 'popular';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

// Store state with preparation days
export interface PackageState {
  packages: Package[];
  currentPackage: Package | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: {
    search: string;
    categories: number[];
    planners: number[];
    sortBy: string;
    sortOrder: string;
  };
}

// Actions with preparation days methods
export interface PackageActions {
  fetchPackages: (params?: PackageSearchParams) => Promise<void>;
  fetchPackageById: (id: number) => Promise<void>;
  searchPackages: (params: PackageSearchParams) => Promise<void>;
  setFilters: (filters: Partial<PackageState['filters']>) => void;
  clearCurrentPackage: () => void;
  clearError: () => void;
  // NEW: Preparation days methods
  fetchPreparationDays: (packageId: number) => Promise<PreparationDaysInfo>;
  checkPreparationPeriod: (packageId: number, date: string) => Promise<PreparationPeriodCheck>;
  fetchUpcomingAvailability: (packageId: number, daysAhead?: number, limit?: number) => Promise<UpcomingAvailabilityResponse>;
}

export type PackageStore = PackageState & PackageActions;