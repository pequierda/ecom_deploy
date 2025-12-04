// types/booking.ts

export interface BookingFormData {
  // Essential booking data
  weddingDate: string;
  weddingTime: string;
  venue: string;
  specialRequests: string;
  
  // Payment data
  paymentMethod: 'gcash' | 'maya' | 'bank_transfer' | '';
  paymentAmount: number;
  receiptFile: File | null;
  receiptPreview: string;
  
  // Agreements
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  allowMarketing: boolean;
}

export interface BookingValidation {
  isValid: boolean;
  errors: string[];
}

export interface BookingState {
  formData: BookingFormData;
  currentStep: 'details' | 'confirmation' | 'success';
  isSubmitting: boolean;
  error: string | null;
  bookingId: string | null;
}

export interface BookingActions {
  updateFormData: (data: Partial<BookingFormData>) => void;
  setCurrentStep: (step: BookingState['currentStep']) => void;
  setError: (error: string | null) => void;
  submitBooking: (packageId: number) => Promise<void>;
  resetBooking: () => void;
  validateStep: (step: 'details' | 'confirmation') => BookingValidation;
  persistBookingData: (packageId: number) => void;
  restoreBookingData: (packageId: number) => boolean;
}

export type BookingStore = BookingState & BookingActions;

// API Request/Response types
export interface CreateBookingRequest {
  // Essential booking data
  packageId: number;
  weddingDate: string;
  weddingTime?: string;
  venue: string;
  specialRequests?: string;
  
  // Payment data
  paymentMethod?: 'gcash' | 'maya' | 'bank_transfer';
  paymentAmount?: number;
  receiptFile?: File;
  
  allowMarketing?: boolean;
}

export interface CreateBookingResponse {
  message: string;
  bookingId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}
