// pages/admin/Services.tsx
import React, { useState } from 'react';
import { Package, Search, Filter, Eye, AlertTriangle, CheckCircle, XCircle, Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const AdminServices = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const services = [
    {
      id: 1,
      name: 'Premium Wedding Package',
      planner: 'Maria Santos',
      businessName: 'Creative Events PH',
      category: 'premium',
      price: 85000,
      description: 'Complete wedding planning service with premium venue decorations, photography, and full coordination.',
      services: ['Venue Decoration', 'Photography', 'Catering', 'Full Coordination', 'Bridal Car'],
      status: 'active',
      totalBookings: 12,
      averageRating: 4.9,
      totalReviews: 15,
      lastUpdated: '2025-01-10',
      compliance: {
        pricing: 'approved',
        description: 'approved',
        images: 'approved',
        terms: 'approved'
      },
      flags: [],
      revenue: 1020000
    },
    {
      id: 2,
      name: 'Garden Wedding Special',
      planner: 'Carlos Mendoza',
      businessName: 'Seaside Weddings Co.',
      category: 'standard',
      price: 65000,
      description: 'Beautiful outdoor garden wedding setup with floral arrangements and natural decorations.',
      services: ['Garden Setup', 'Floral Arrangements', 'Photography', 'Basic Coordination'],
      status: 'active',
      totalBookings: 8,
      averageRating: 4.8,
      totalReviews: 10,
      lastUpdated: '2025-01-08',
      compliance: {
        pricing: 'approved',
        description: 'approved',
        images: 'pending',
        terms: 'approved'
      },
      flags: ['image_quality'],
      revenue: 520000
    },
    {
      id: 3,
      name: 'Luxury Destination Wedding',
      planner: 'Lisa Gonzalez',
      businessName: 'Mountain View Events',
      category: 'premium',
      price: 150000,
      description: 'Exclusive destination wedding package with travel coordination and luxury accommodations.',
      services: ['Destination Coordination', 'Luxury Accommodations', 'Travel Planning', 'Premium Setup'],
      status: 'under_review',
      totalBookings: 3,
      averageRating: 5.0,
      totalReviews: 3,
      lastUpdated: '2025-01-12',
      compliance: {
        pricing: 'under_review',
        description: 'approved',
        images: 'approved',
        terms: 'needs_revision'
      },
      flags: ['pricing_concern', 'terms_unclear'],
      revenue: 450000
    },
    {
      id: 4,
      name: 'Budget-Friendly Wedding',
      planner: 'Anna Kim',
      businessName: 'Simple Celebrations',
      category: 'basic',
      price: 35000,
      description: 'Affordable wedding package for couples on a budget.',
      services: ['Basic Decoration', 'Photography', 'Simple Coordination'],
      status: 'suspended',
      totalBookings: 2,
      averageRating: 3.5,
      totalReviews: 4,
      lastUpdated: '2025-01-05',
      compliance: {
        pricing: 'approved',
        description: 'needs_revision',
        images: 'rejected',
        terms: 'approved'
      },
      flags: ['quality_concerns', 'poor_images', 'unclear_description'],
      revenue: 70000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'under_review': return 'text-blue-600';
      case 'needs_revision': return 'text-orange-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return AlertTriangle;
      case 'under_review': return AlertTriangle;
      case 'needs_revision': return AlertTriangle;
      case 'rejected': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.planner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || service.status === activeTab;
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesTab && matchesCategory;
  });

  const stats = {
    totalServices: services.length,
    activeServices: services.filter(s => s.status === 'active').length,
    pendingReview: services.filter(s => s.status === 'under_review').length,
    suspendedServices: services.filter(s => s.status === 'suspended').length,
    totalRevenue: services.reduce((sum, s) => sum + s.revenue, 0),
    avgRating: services.reduce((sum, s) => sum + s.averageRating, 0) / services.length
  };

  return (
    <DashboardLayout 
      title="Service Management"
      subtitle="Monitor and manage wedding service packages across all planners"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              <p className="text-sm text-gray-600">Total Services</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeServices}</p>
              <p className="text-sm text-gray-600">Active Services</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-pink-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">₱{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="border-b border-gray-200 flex-1">
            <nav className="-mb-px flex space-x-8">
              {['all', 'active', 'under_review', 'suspended'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm w-64"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            >
              <option value="all">All Categories</option>
              <option value="premium">Premium</option>
              <option value="standard">Standard</option>
              <option value="basic">Basic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(service.category)}`}>
                      {service.category}
                    </span>
                    {service.flags.length > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        {service.flags.length} flags
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{service.planner} • {service.businessName}</p>
                  <p className="text-xs text-gray-500">Updated: {new Date(service.lastUpdated).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1).replace('_', ' ')}
                  </span>
                  <div className="mt-2">
                    <p className="text-lg font-bold text-gray-900">₱{service.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                {/* Left Column - Service Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Description:</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Included Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.services.slice(0, 3).map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {item}
                        </span>
                      ))}
                      {service.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{service.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Column - Performance Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Bookings:</span>
                    <span className="ml-2 font-medium text-gray-900">{service.totalBookings}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                    <span className="text-gray-600">Rating:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {service.averageRating} ({service.totalReviews} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                    <span className="text-gray-600">Revenue:</span>
                    <span className="ml-2 font-medium text-gray-900">₱{(service.revenue / 1000).toFixed(0)}K</span>
                  </div>
                </div>

                {/* Right Column - Compliance Status */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Compliance Status</h4>
                  {Object.entries(service.compliance).map(([item, status]) => {
                    const Icon = getComplianceIcon(status);
                    return (
                      <div key={item} className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Icon className={`w-4 h-4 mr-2 ${getComplianceColor(status)}`} />
                          <span className="text-gray-600 capitalize">{item}</span>
                        </div>
                        <span className={`text-xs font-medium ${getComplianceColor(status)}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flags Section */}
              {service.flags.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Flagged Issues:</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.flags.map((flag, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Contact Planner
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  {service.status === 'under_review' && (
                    <>
                      <button className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                    </>
                  )}
                  
                  {service.status === 'active' && service.flags.length > 0 && (
                    <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Request Changes
                    </button>
                  )}
                  
                  {service.status === 'suspended' && (
                    <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600">
            {searchQuery || filterCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No services match the selected status.'}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminServices;