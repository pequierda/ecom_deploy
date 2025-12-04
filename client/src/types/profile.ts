// types/profile.ts

export type ProfileTab = 'profile' | 'business' | 'permits' | 'reviews';
export type PermitStatus = 'active' | 'expired' | 'pending' | 'approved' | 'rejected';
export type PlannerStatus = 'pending' | 'approved' | 'rejected';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  profilePicture?: string;
}

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  yearsInBusiness: string;
  servicesOffered: string[];
  socialMedia: {
    facebook: string;
    instagram: string;
    website: string;
  };
}

export interface PermitAttachment {
  attachment_id: number;
  permit_id: number;
  file_url: string;
  file_type: string;
  gov_id_type?: string;
  gov_id_number?: string;
  permit_status: PermitStatus;
  notes: string;
  uploaded_at: string;
}

export interface PermitData {
  permit_id?: number;
  status: PlannerStatus;
  attachments: PermitAttachment[];
  submitted_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  verification_notes?: string;
}

export interface PermitInfo {
  businessPermit: {
    number: string;
    issueDate: string;
    expiryDate: string;
    status: PermitStatus;
  };
  mayorPermit: {
    number: string;
    issueDate: string;
    expiryDate: string;
    status: PermitStatus;
  };
  birRegistration: {
    number: string;
    issueDate: string;
    status: PermitStatus;
  };
  // Add permit approval data
  permitApproval?: PermitData;
}

export interface Review {
  id: number;
  client: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Statistics {
  totalBookings: number;
  completedWeddings: number;
  averageRating: number;
  totalReviews: number;
  clientRetention: number;
  responseTime: string;
}

export interface ProfileData {
  personalInfo: PersonalInfo;
  businessInfo: BusinessInfo;
  permitInfo: PermitInfo;
  statistics: Statistics;
  recentReviews: Review[];
  // Add planner status
  plannerStatus: PlannerStatus;
}

export interface ProfileFormData {
  personalInfo: Partial<PersonalInfo>;
  businessInfo: Partial<BusinessInfo>;
}

export interface ProfileState {
  data: ProfileData | null;
  activeTab: ProfileTab;
  isEditing: boolean;
  loading: boolean;
  error: string | null;
  uploadingImage: boolean;
  uploadingDocument: boolean;
}

export interface ProfileActions {
  fetchProfile: () => Promise<void>;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => Promise<void>;
  updateBusinessInfo: (data: Partial<BusinessInfo>) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  uploadPermitDocument: (file: File, govIdType: string, govIdNumber: string, replaceAttachmentId?: number) => Promise<void>;
  setActiveTab: (tab: ProfileTab) => void;
  setIsEditing: (editing: boolean) => void;
  clearError: () => void;
  reset: () => void;
}