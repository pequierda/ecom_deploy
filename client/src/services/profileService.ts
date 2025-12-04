// services/profileService.ts
import type { PersonalInfo, BusinessInfo, ProfileData } from '../types/profile';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ProfileService {
  async fetchProfile(): Promise<ProfileData> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch profile');
    }
  }

  async updatePersonalInfo(personalInfo: Partial<PersonalInfo>): Promise<PersonalInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/personal`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalInfo),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update authStore with new personal info
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          first_name: personalInfo.firstName || authStore.user.first_name,
          last_name: personalInfo.lastName || authStore.user.last_name,
          phone: personalInfo.phone || authStore.user.phone,
          bio: personalInfo.bio || authStore.user.bio,
          location: personalInfo.address || authStore.user.location,
        });
      }
      
      return data.personalInfo;
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update personal information');
    }
  }

  async updateBusinessInfo(businessInfo: Partial<BusinessInfo>): Promise<BusinessInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/business`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessInfo),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update authStore with new business info
      const authStore = useAuthStore.getState();
      if (authStore.user && authStore.user.plannerProfile) {
        authStore.setUser({
          ...authStore.user,
          plannerProfile: {
            ...authStore.user.plannerProfile,
            business_name: businessInfo.businessName || authStore.user.plannerProfile.business_name,
            business_address: businessInfo.businessAddress || authStore.user.plannerProfile.business_address,
            business_email: businessInfo.businessEmail || authStore.user.plannerProfile.business_email,
            business_phone: businessInfo.businessPhone || authStore.user.plannerProfile.business_phone,
          }
        });
      }
      
      return data.businessInfo;
    } catch (error) {
      console.error('Error updating business info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update business information');
    }
  }

  async uploadProfilePicture(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${API_BASE_URL}/users/profile/picture`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update authStore with new profile picture
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          profile_picture: data.profilePictureUrl
        });
      }
      
      return data.profilePictureUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload profile picture');
    }
  }

  async uploadPermitDocument(file: File, govIdType: string, govIdNumber: string, replaceAttachmentId?: number): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('permitDocument', file);
      formData.append('govIdType', govIdType);
      formData.append('govIdNumber', govIdNumber);
      
      // Add replaceAttachmentId if this is a document replacement
      if (replaceAttachmentId) {
        formData.append('replaceAttachmentId', replaceAttachmentId.toString());
      }

      const response = await fetch(`${API_BASE_URL}/users/profile/permit-document`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Note: We don't need to update authStore here as the profile store will 
      // refresh the profile data which includes permit attachments
      
    } catch (error) {
      console.error('Error uploading permit document:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload permit document');
    }
  }

  async fetchStatistics(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/statistics`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch statistics');
    }
  }

  async fetchRecentReviews(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/reviews/recent`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reviews;
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch recent reviews');
    }
  }
}

export const profileService = new ProfileService();