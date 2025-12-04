// stores/profileStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  ProfileState, 
  ProfileActions, 
  ProfileTab, 
  PersonalInfo, 
  BusinessInfo,
  ProfileData
} from '../types/profile';
import { profileService } from '../services/profileService';

const initialState: Omit<ProfileState, keyof ProfileActions> = {
  data: null,
  activeTab: 'profile',
  isEditing: false,
  loading: false,
  error: null,
  uploadingImage: false,
  uploadingDocument: false, // Add this new state
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchProfile: async () => {
        set({ loading: true, error: null });

        try {
          const profileData = await profileService.fetchProfile();
          
          set({
            data: profileData,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch profile'
          });
        }
      },

      updatePersonalInfo: async (personalInfoData: Partial<PersonalInfo>) => {
        const currentData = get().data;
        if (!currentData) {
          set({ error: 'No profile data available' });
          return;
        }

        set({ loading: true, error: null });

        try {
          const updatedPersonalInfo = await profileService.updatePersonalInfo(personalInfoData);
          
          const updatedData: ProfileData = {
            ...currentData,
            personalInfo: updatedPersonalInfo
          };

          set({
            data: updatedData,
            loading: false,
            isEditing: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update personal information'
          });
        }
      },

      updateBusinessInfo: async (businessInfoData: Partial<BusinessInfo>) => {
        const currentData = get().data;
        if (!currentData) {
          set({ error: 'No profile data available' });
          return;
        }

        set({ loading: true, error: null });

        try {
          const updatedBusinessInfo = await profileService.updateBusinessInfo(businessInfoData);
          
          const updatedData: ProfileData = {
            ...currentData,
            businessInfo: updatedBusinessInfo
          };

          set({
            data: updatedData,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update business information'
          });
        }
      },

      uploadProfilePicture: async (file: File) => {
        const currentData = get().data;
        if (!currentData) {
          set({ error: 'No profile data available' });
          return;
        }

        set({ uploadingImage: true, error: null });

        try {
          const profilePictureUrl = await profileService.uploadProfilePicture(file);
          
          const updatedData: ProfileData = {
            ...currentData,
            personalInfo: {
              ...currentData.personalInfo,
              profilePicture: profilePictureUrl
            }
          };

          set({
            data: updatedData,
            uploadingImage: false,
            error: null
          });
        } catch (error) {
          set({
            uploadingImage: false,
            error: error instanceof Error ? error.message : 'Failed to upload profile picture'
          });
        }
      },

      // New method for uploading permit documents
      uploadPermitDocument: async (file: File, govIdType: string, govIdNumber: string, replaceAttachmentId?: number) => {
        set({ uploadingDocument: true, error: null });

        try {
          await profileService.uploadPermitDocument(file, govIdType, govIdNumber, replaceAttachmentId);
          
          // Refresh the profile data to get updated permit attachments
          await get().fetchProfile();
          
          set({
            uploadingDocument: false,
            error: null
          });
        } catch (error) {
          set({
            uploadingDocument: false,
            error: error instanceof Error ? error.message : 'Failed to upload permit document'
          });
        }
      },

      setActiveTab: (tab: ProfileTab) => {
        set({ activeTab: tab });
      },

      setIsEditing: (editing: boolean) => {
        set({ isEditing: editing, error: null });
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'profile-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);