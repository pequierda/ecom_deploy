// pages/client/Profile.tsx
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Heart, Camera, Save, Edit3 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../stores/authStore';

const ClientProfile = () => {
  const { user } = useAuthStore();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || '';
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: displayName,
    email: user?.email || '',
    phone: '+63 912 345 6789',
    address: 'Makati City, Metro Manila',
    weddingDate: '2025-06-20',
    partnerName: 'John Doe',
    venue: 'Garden Paradise Resort',
    budget: '₱250,000',
    guestCount: '150',
    preferences: {
      style: 'Garden/Outdoor',
      colors: 'Blush Pink, Gold',
      season: 'Summer'
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  return (
    <DashboardLayout 
      title="My Profile"
      subtitle="Manage your personal information and wedding preferences"
    >
      <div className="max-w-8xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-800">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                  <p className="text-gray-600">Wedding Client</p>
                </div>
              </div>
              
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
              >
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wedding Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-600" />
              Wedding Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partner's Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.partnerName}
                      onChange={(e) => handleInputChange('partnerName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.partnerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Wedding Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.weddingDate}
                      onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{new Date(profileData.weddingDate).toLocaleDateString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.venue}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.budget}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guest Count</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.guestCount}
                      onChange={(e) => handleInputChange('guestCount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.guestCount} guests</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wedding Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wedding Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Style</label>
                {isEditing ? (
                  <select
                    value={profileData.preferences.style}
                    onChange={(e) => handlePreferenceChange('style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Garden/Outdoor">Garden/Outdoor</option>
                    <option value="Beach">Beach</option>
                    <option value="Church">Church</option>
                    <option value="Modern/Contemporary">Modern/Contemporary</option>
                    <option value="Rustic">Rustic</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profileData.preferences.style}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.preferences.colors}
                    onChange={(e) => handlePreferenceChange('colors', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., Blush Pink, Gold"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.preferences.colors}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                {isEditing ? (
                  <select
                    value={profileData.preferences.season}
                    onChange={(e) => handlePreferenceChange('season', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profileData.preferences.season}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;