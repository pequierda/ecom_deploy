// pages/planner/Profile.tsx
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Edit3, Save, X, Star, Award, Calendar, Users, CheckCircle, AlertCircle, FileText, Upload, Image, Info } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useProfile } from '../../hooks/useProfile';
import type { PersonalInfo, BusinessInfo } from '../../types/profile';

const PlannerProfile = () => {
  const {
    data,
    activeTab,
    isEditing,
    loading,
    error,
    uploadingImage,
    uploadingDocument,
    hasProfileData,
    fullName,
    businessName,
    averageRating,
    totalReviews,
    permitExpiryWarnings,
    hasPermitWarnings,
    handleTabChange,
    handleEditToggle,
    handleCancelEdit,
    handleSavePersonalInfo,
    handleSaveBusinessInfo,
    handleProfilePictureUpload,
    handlePermitDocumentUpload,
    handleRetry,
    getPermitStatusColor,
    getStarRating,
    formatDate,
    capitalizeStatus
  } = useProfile();

  // Local form state
  const [personalFormData, setPersonalFormData] = useState<Partial<PersonalInfo>>({});
  const [businessFormData, setBusinessFormData] = useState<Partial<BusinessInfo>>({});
  const [showUploadInstructions, setShowUploadInstructions] = useState(false);
  const [permitUploadData, setPermitUploadData] = useState({
    govIdType: '',
    govIdNumber: ''
  });

  // Initialize form data when editing starts
  React.useEffect(() => {
    if (isEditing && data) {
      setPersonalFormData({
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        address: data.personalInfo.address,
        bio: data.personalInfo.bio
      });
      setBusinessFormData({
        businessName: data.businessInfo.businessName,
        businessAddress: data.businessInfo.businessAddress,
        businessEmail: data.businessInfo.businessEmail,
        businessPhone: data.businessInfo.businessPhone
      });
    }
  }, [isEditing, data]);

  const handleSave = async () => {
    if (activeTab === 'profile') {
      await handleSavePersonalInfo(personalFormData);
    } else if (activeTab === 'business') {
      await handleSaveBusinessInfo(businessFormData);
    }
  };

  const handleCancel = () => {
    handleCancelEdit();
    setPersonalFormData({});
    setBusinessFormData({});
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfilePictureUpload(file);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && permitUploadData.govIdType && permitUploadData.govIdNumber) {
      handlePermitDocumentUpload(file, permitUploadData.govIdType, permitUploadData.govIdNumber);
      setPermitUploadData({ govIdType: '', govIdNumber: '' });
    }
  };

  const handleDocumentReplace = (event: React.ChangeEvent<HTMLInputElement>, attachmentId: number, govIdType: string, govIdNumber: string) => {
    const file = event.target.files?.[0];
    if (file) {
      handlePermitDocumentUpload(file, govIdType, govIdNumber, attachmentId);
    }
  };

  if (loading && !hasProfileData) {
    return (
      <DashboardLayout 
        title="Business Profile"
        subtitle="Manage your business information and credentials"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !hasProfileData) {
    return (
      <DashboardLayout 
        title="Business Profile"
        subtitle="Manage your business information and credentials"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800">
            <h3 className="text-lg font-medium mb-2">Error Loading Profile</h3>
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout 
        title="Business Profile"
        subtitle="Manage your business information and credentials"
      >
        <div className="text-center py-8 text-gray-500">
          No profile data available
        </div>
      </DashboardLayout>
    );
  }

  function clearError(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <DashboardLayout 
      title="Business Profile"
      subtitle="Manage your business information and credentials"
    >
      {/* Planner Status Alert */}
      {data.plannerStatus && data.plannerStatus !== 'approved' && (
        <div className={`mb-6 p-4 rounded-lg border ${
          data.plannerStatus === 'rejected' ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start">
            <AlertCircle className={`w-5 h-5 mt-0.5 mr-3 ${
              data.plannerStatus === 'rejected' ? 'text-yellow-500' : 'text-yellow-500'
            }`} />
            <div>
              <h4 className={`font-medium ${
                data.plannerStatus === 'rejected' ? 'text-yellow-900' : 'text-yellow-900'
              }`}>
                {data.plannerStatus === 'rejected' ? 'Document Review Required' : 'Account Pending Approval'}
              </h4>
              <p className={`text-sm mt-1 ${
                data.plannerStatus === 'rejected' ? 'text-yellow-700' : 'text-yellow-700'
              }`}>
                {data.plannerStatus === 'rejected'
                  ? 'Some documents need attention. Please check the Permits & Licenses section to view specific feedback and resubmit documents as needed.'
                  : 'Your planner account is currently under review. You can update your profile but cannot access booking features until approved.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profile Information' },
              { id: 'permits', label: 'Permits & Licenses' },
              { id: 'reviews', label: 'Reviews & Ratings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.id === 'permits' && data.plannerStatus === 'rejected' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Action Required
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
            <button 
              onClick={() => clearError()}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {data.personalInfo.profilePicture ? (
                      <img 
                        src={data.personalInfo.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-picture-upload"
                      />
                      <label
                        htmlFor="profile-picture-upload"
                        className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 cursor-pointer flex items-center justify-center"
                      >
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </label>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{fullName}</h4>
                  <p className="text-gray-600">{businessName}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center space-x-1">
                      {getStarRating(Math.floor(averageRating)).map((star) => (
                        <Star
                          key={star.index}
                          className={`w-4 h-4 ${
                            star.filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {averageRating} ({totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={personalFormData.firstName || ''}
                        onChange={(e) => setPersonalFormData({
                          ...personalFormData,
                          firstName: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{data.personalInfo.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={personalFormData.email || ''}
                        onChange={(e) => setPersonalFormData({
                          ...personalFormData,
                          email: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {data.personalInfo.email}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={personalFormData.phone || ''}
                        onChange={(e) => setPersonalFormData({
                          ...personalFormData,
                          phone: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {data.personalInfo.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={personalFormData.lastName || ''}
                        onChange={(e) => setPersonalFormData({
                          ...personalFormData,
                          lastName: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{data.personalInfo.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    {isEditing ? (
                      <textarea
                        value={personalFormData.address || ''}
                        onChange={(e) => setPersonalFormData({
                          ...personalFormData,
                          address: e.target.value
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-start text-gray-900">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        {data.personalInfo.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    value={personalFormData.bio || ''}
                    onChange={(e) => setPersonalFormData({
                      ...personalFormData,
                      bio: e.target.value
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Tell potential clients about your experience and specialties..."
                  />
                ) : (
                  <p className="text-gray-900">{data.personalInfo.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-pink-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{data.statistics.totalBookings}</p>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{data.statistics.clientRetention}%</p>
                  <p className="text-sm text-gray-600">Retention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Details Tab */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <p className="text-gray-900">{data.businessInfo.businessName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <p className="text-gray-900">{data.businessInfo.businessType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
                  <p className="text-gray-900">{data.businessInfo.yearsInBusiness} years</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <p className="text-gray-900">{data.businessInfo.socialMedia.website}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  <p className="text-gray-900">{data.businessInfo.socialMedia.facebook}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <p className="text-gray-900">{data.businessInfo.socialMedia.instagram}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
              <div className="flex flex-wrap gap-2">
                {data.businessInfo.servicesOffered.map((service, index) => (
                  <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permits & Licenses Tab */}
      {activeTab === 'permits' && (
        <div className="space-y-6">
          {/* Document Upload Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-2">Document Upload Requirements</h4>
                <p className="text-sm text-blue-700 mb-3">
                  To complete your planner verification, please upload clear photos or scanned copies of the following documents:
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1 mb-4">
                  <li>Valid government-issued ID (Driver's License, Passport, etc.)</li>
                  <li>Business Registration Certificate</li>
                  <li>Mayor's Permit or Business Permit</li>
                  <li>BIR Certificate of Registration</li>
                </ul>
                <button
                  onClick={() => setShowUploadInstructions(!showUploadInstructions)}
                  className="text-sm text-blue-700 font-medium hover:text-blue-800"
                >
                  {showUploadInstructions ? 'Hide' : 'View'} photo guidelines →
                </button>
              </div>
            </div>
            
            {/* Upload Instructions with Sample Image */}
            {showUploadInstructions && (
              <div className="mt-4 border-t border-blue-200 pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-blue-900 mb-2">Photo Guidelines:</h5>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Take photos in good lighting
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Ensure all text is clearly readable
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Include all four corners of the document
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use flat surface, avoid shadows
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        File formats: JPG, PNG, PDF (Max 10MB)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-900 mb-2">Sample Document Photo:</h5>
                    <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                      <Image className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-blue-600">Clear, well-lit document photo</p>
                      <p className="text-xs text-blue-500 mt-1">All corners visible, text readable</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Government ID Type</label>
                  <select
                    value={permitUploadData.govIdType}
                    onChange={(e) => setPermitUploadData({
                      ...permitUploadData,
                      govIdType: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select ID Type</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                    <option value="voters_id">Voter's ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={permitUploadData.govIdNumber}
                    onChange={(e) => setPermitUploadData({
                      ...permitUploadData,
                      govIdNumber: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter ID number"
                  />
                </div>
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="permit-document-upload"
                  disabled={!permitUploadData.govIdType || !permitUploadData.govIdNumber}
                />
                <label
                  htmlFor="permit-document-upload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer ${
                    !permitUploadData.govIdType || !permitUploadData.govIdNumber || uploadingDocument
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {uploadingDocument ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Please fill in ID type and number before uploading
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          {data.permitInfo.permitApproval?.attachments && data.permitInfo.permitApproval.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Submitted Documents</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {data.permitInfo.permitApproval.attachments.map((attachment, index) => (
                    <div key={attachment.attachment_id} className={`border rounded-lg p-4 ${
                      attachment.permit_status === 'rejected' ? 'border-red-200 bg-red-50' : 
                      attachment.permit_status === 'approved' ? 'border-green-200 bg-green-50' : 
                      'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {attachment.gov_id_type?.replace('_', ' ').toUpperCase()} - {attachment.gov_id_number}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Uploaded on {formatDate(attachment.uploaded_at)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPermitStatusColor(attachment.permit_status as any)}`}>
                          {capitalizeStatus(attachment.permit_status)}
                        </span>
                      </div>
                      
                      {attachment.notes && (
                        <div className={`mt-2 p-2 rounded text-sm ${
                          attachment.permit_status === 'rejected' ? 'bg-red-100 text-red-700' :
                          attachment.permit_status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          <strong>
                            {attachment.permit_status === 'rejected' ? 'Rejection Reason: ' : 'Admin Note: '}
                          </strong>
                          {attachment.notes}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <a
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Image className="w-4 h-4 mr-1" />
                          View Document
                        </a>
                        
                        {attachment.permit_status === 'rejected' && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleDocumentReplace(
                                e,
                                attachment.attachment_id,
                                attachment.gov_id_type ?? '',
                                attachment.gov_id_number ?? ''
                              )}
                              className="hidden"
                              id={`replace-document-${attachment.attachment_id}`}
                            />
                            <label
                              htmlFor={`replace-document-${attachment.attachment_id}`}
                              className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 cursor-pointer"
                            >
                              {uploadingDocument ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  Replacing...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3 h-3 mr-1" />
                                  Replace Document
                                </>
                              )}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {data.permitInfo.permitApproval.verification_notes && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Verification Notes</h4>
                    <p className="text-sm text-blue-700">{data.permitInfo.permitApproval.verification_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}


        </div>
      )}

      {/* Reviews & Ratings Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Rating Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Rating Overview</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{data.statistics.averageRating}</div>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {getStarRating(Math.floor(data.statistics.averageRating)).map((star) => (
                      <Star
                        key={star.index}
                        className={`w-4 h-4 ${
                          star.filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{data.statistics.totalReviews} total reviews</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">96%</div>
                  <p className="text-sm text-gray-600">Positive feedback</p>
                  <p className="text-xs text-gray-500">Based on 4+ star ratings</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{data.statistics.responseTime}</div>
                  <p className="text-sm text-gray-600">Avg response time</p>
                  <p className="text-xs text-gray-500">To client messages</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {data.recentReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{review.client}</h4>
                          {review.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" title="Verified review" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStarRating(review.rating).map((star) => (
                            <Star
                              key={star.index}
                              className={`w-4 h-4 ${
                                star.filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-pink-600 hover:text-pink-700 font-medium text-sm">
                  View All Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PlannerProfile;