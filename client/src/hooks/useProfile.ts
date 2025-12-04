// hooks/useProfile.ts
import { useEffect, useMemo } from 'react';
import { useProfileStore } from '../stores/profileStore';
import type { ProfileTab, PersonalInfo, BusinessInfo, PermitStatus } from '../types/profile';

export const useProfile = () => {
  const {
    data,
    activeTab,
    isEditing,
    loading,
    error,
    uploadingImage,
    uploadingDocument,
    fetchProfile,
    updatePersonalInfo,
    updateBusinessInfo,
    uploadProfilePicture,
    uploadPermitDocument,
    setActiveTab,
    setIsEditing,
    clearError
  } = useProfileStore();

  // Fetch initial profile data
  useEffect(() => {
    if (!data) {
      fetchProfile();
    }
  }, [fetchProfile, data]);

  // Handlers
  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    clearError();
  };

  const handleSavePersonalInfo = async (personalInfoData: Partial<PersonalInfo>) => {
    try {
      await updatePersonalInfo(personalInfoData);
    } catch (error) {
      console.error('Failed to save personal info:', error);
    }
  };

  const handleSaveBusinessInfo = async (businessInfoData: Partial<BusinessInfo>) => {
    try {
      await updateBusinessInfo(businessInfoData);
    } catch (error) {
      console.error('Failed to save business info:', error);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      await uploadProfilePicture(file);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
    }
  };

  const handlePermitDocumentUpload = async (file: File, govIdType: string, govIdNumber: string, replaceAttachmentId?: number) => {
    try {
      await uploadPermitDocument(file, govIdType, govIdNumber, replaceAttachmentId);
    } catch (error) {
      console.error('Failed to upload permit document:', error);
    }
  };

  const handleRetry = () => {
    clearError();
    fetchProfile();
  };

  // Utility functions
  const getPermitStatusColor = (status: PermitStatus): string => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Utility function to get star rating data (no JSX)
  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => ({
      index: i,
      filled: i < Math.floor(rating)
    }));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const capitalizeStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Computed values
  const hasProfileData = data !== null;
  const fullName = data ? `${data.personalInfo.firstName} ${data.personalInfo.lastName}` : '';
  const businessName = data?.businessInfo.businessName || '';
  const averageRating = data?.statistics?.averageRating || 0;
  const totalReviews = data?.statistics?.totalReviews || 0;

  // Check if permits are expiring soon (within 30 days)
  const permitExpiryWarnings = useMemo(() => {
    if (!data?.permitInfo) return [];
    
    const warnings: string[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const permits = [
      { name: 'Business Permit', ...data.permitInfo.businessPermit },
      { name: 'Mayor\'s Permit', ...data.permitInfo.mayorPermit }
    ];

    permits.forEach(permit => {
      if (permit.expiryDate) {
        const expiryDate = new Date(permit.expiryDate);
        if (expiryDate <= thirtyDaysFromNow && permit.status === 'active') {
          warnings.push(`${permit.name} expires on ${formatDate(permit.expiryDate)}`);
        }
      }
    });

    return warnings;
  }, [data?.permitInfo]);

  const hasPermitWarnings = permitExpiryWarnings.length > 0;

  return {
    // State
    data,
    activeTab,
    isEditing,
    loading,
    error,
    uploadingImage,
    uploadingDocument,
    
    // Computed values
    hasProfileData,
    fullName,
    businessName,
    averageRating,
    totalReviews,
    permitExpiryWarnings,
    hasPermitWarnings,
    
    // Handlers
    handleTabChange,
    handleEditToggle,
    handleCancelEdit,
    handleSavePersonalInfo,
    handleSaveBusinessInfo,
    handleProfilePictureUpload,
    handlePermitDocumentUpload,
    handleRetry,
    
    // Utility functions
    getPermitStatusColor,
    getStarRating,
    formatDate,
    capitalizeStatus,
    
    // Actions
    fetchProfile,
    clearError
  };
};