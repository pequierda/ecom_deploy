import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit3, Eye, Trash2, Star, Users, Loader2, AlertCircle, Upload, X, ExternalLink, Camera, Check, Search } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAuthStore } from '../../stores/authStore';
import type { PackageResponse } from '../../types/package';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Category {
  category_id: number;
  name: string;
  description: string;
}

interface PackageAttachment {
  attachment_id: number;
  file_url: string;
  file_type: string;
  is_thumbnail: boolean;
  uploaded_at: string;
}

interface AttachmentFormData {
  type: 'file' | 'url';
  files: File[];
  urls: string[];
  thumbnailIndex: number;
}

interface ConfirmationState {
  isOpen: boolean;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  isLoading: boolean;
}

interface Filters {
  status: string;
  search: string;
}

const PlannerServices = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    search: ''
  });
  const [packages, setPackages] = useState<PackageResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageResponse | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  
  // Image upload states
  const [currentAttachments, setCurrentAttachments] = useState<PackageAttachment[]>([]);
  const [attachmentForm, setAttachmentForm] = useState<AttachmentFormData>({
    type: 'file',
    files: [],
    urls: [''],
    thumbnailIndex: -1
  });
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  
  // Unified confirmation modal state
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    isLoading: false,
  });

  const { user } = useAuthStore();

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailed_description: '',
    price: '',
    default_slots: 1,
    category_id: '',
    inclusions: [''],
  });

  // Utility function to show confirmation modal
  const showConfirmation = (config: Partial<ConfirmationState>) => {
    setConfirmation(prev => ({
      ...prev,
      isOpen: true,
      ...config,
    }));
  };

  // Utility function to close confirmation modal
  const closeConfirmation = () => {
    setConfirmation(prev => ({
      ...prev,
      isOpen: false,
      isLoading: false,
    }));
  };

  // Utility function to set confirmation loading
  const setConfirmationLoading = (isLoading: boolean) => {
    setConfirmation(prev => ({
      ...prev,
      isLoading,
    }));
  };

  // Fetch planner's packages with filters
  const fetchPackages = async (filters: Filters = { status: 'all', search: '' }) => {
    if (!user?.user_id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') {
        queryParams.append('is_active', filters.status === 'active' ? 'true' : 'false');
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const url = `${API_BASE_URL}/packages/planner/${user.user_id}?${queryParams.toString()}`;
      console.log('Fetching packages from:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch packages' }));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch packages`);
      }
      
      const data = await response.json();
      console.log('Fetched packages:', data);
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch packages error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch package attachments
  const fetchPackageAttachments = async (packageId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}/attachments`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch attachments');
      
      const data = await response.json();
      setCurrentAttachments(data.images || []);
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setCurrentAttachments([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPackages(filters);
  }, [user?.user_id]);

  // Handle tab change with API call
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    const newFilters = {
      ...filters,
      status: tab
    };
    
    setFilters(newFilters);
    fetchPackages(newFilters);
  };

  // Handle search with API call
  const handleSearch = (searchTerm: string) => {
    const newFilters = {
      ...filters,
      search: searchTerm
    };
    
    setFilters(newFilters);
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchPackages(newFilters);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle file selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachmentForm(prev => ({
        ...prev,
        files: files,
        thumbnailIndex: files.length > 0 ? 0 : -1 // Set first file as thumbnail by default
      }));
    }
  };

  // Handle URL input
  const handleUrlChange = (index: number, value: string) => {
    setAttachmentForm(prev => ({
      ...prev,
      urls: prev.urls.map((url, i) => i === index ? value : url)
    }));
  };

  // Add new URL input
  const addUrlInput = () => {
    setAttachmentForm(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }));
  };

  // Remove URL input
  const removeUrlInput = (index: number) => {
    setAttachmentForm(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index),
      thumbnailIndex: prev.thumbnailIndex === index ? -1 : 
                     prev.thumbnailIndex > index ? prev.thumbnailIndex - 1 : prev.thumbnailIndex
    }));
  };

  // Upload attachments
  const uploadAttachments = async (packageId: number) => {
    if (attachmentForm.files.length === 0 && attachmentForm.urls.every(url => !url.trim())) {
      return;
    }

    setAttachmentLoading(true);
    
    try {
      // Upload files if any
      if (attachmentForm.files.length > 0) {
        const formData = new FormData();
        formData.append('package_id', packageId.toString());
        
        attachmentForm.files.forEach((file, index) => {
          formData.append('images', file);
          // Mark thumbnail
          formData.append('thumbnails', (index === attachmentForm.thumbnailIndex).toString());
        });

        const response = await fetch(`${API_BASE_URL}/packages/attachments/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload files');
        }
      }

      // Upload URLs if any
      const validUrls = attachmentForm.urls.filter(url => url.trim());
      for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i].trim();
        const isThumbnail = (attachmentForm.files.length === 0 && i === attachmentForm.thumbnailIndex);
        
        const response = await fetch(`${API_BASE_URL}/packages/attachments/url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            package_id: packageId,
            file_url: url,
            file_type: 'image',
            is_thumbnail: isThumbnail
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to add URL: ${url}`);
        }
      }

      // Reset attachment form
      setAttachmentForm({
        type: 'file',
        files: [],
        urls: [''],
        thumbnailIndex: -1
      });

    } catch (err) {
      console.error('Upload attachments error:', err);
      throw err;
    } finally {
      setAttachmentLoading(false);
    }
  };

  // Set attachment as thumbnail
  const setAsThumbnail = async (attachmentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/attachments/${attachmentId}/thumbnail`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set thumbnail');
      }

      // Refresh attachments
      if (editingPackage) {
        await fetchPackageAttachments(editingPackage.package_id);
      }
    } catch (err) {
      console.error('Set thumbnail error:', err);
      setError(err instanceof Error ? err.message : 'Failed to set thumbnail');
    }
  };

  // Remove attachment
  const removeAttachment = async (attachmentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/attachments/${attachmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove attachment');
      }

      // Refresh attachments
      if (editingPackage) {
        await fetchPackageAttachments(editingPackage.package_id);
      }
    } catch (err) {
      console.error('Remove attachment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove attachment');
    }
  };

  // Create new package
  const createPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) return;

    try {
      setCreateLoading(true);
      setError(null);
      
      const packageResponse = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planner_id: user.user_id.toString(),
          title: formData.title,
          description: formData.description,
          detailed_description: formData.detailed_description,
          price: parseFloat(formData.price).toString(),
          default_slots: formData.default_slots.toString(),
          category_id: formData.category_id.toString(),
        }),
      });

      if (!packageResponse.ok) {
        const errorData = await packageResponse.json().catch(() => ({ message: 'Failed to create package' }));
        throw new Error(errorData.message || 'Failed to create package');
      }
      
      const { packageId } = await packageResponse.json();

      // Add inclusions
      const inclusionPromises = formData.inclusions
        .filter(inclusion => inclusion.trim())
        .map(inclusion => 
          fetch(`${API_BASE_URL}/packages/inclusions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              package_id: packageId,
              inclusion_name: inclusion.trim(),
            }),
          })
        );

      await Promise.all(inclusionPromises);

      // Upload attachments
      await uploadAttachments(packageId);

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        detailed_description: '',
        price: '',
        default_slots: 1,
        category_id: '',
        inclusions: [''],
      });
      setShowCreateModal(false);
      
      // Refresh packages with current filters
      await fetchPackages(filters);
    } catch (err) {
      console.error('Create package error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create package');
    } finally {
      setCreateLoading(false);
    }
  };

  // Update package
  const updatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    try {
      setCreateLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/packages/${editingPackage.package_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          detailed_description: formData.detailed_description,
          price: parseFloat(formData.price),
          default_slots: formData.default_slots,
          is_active: editingPackage.is_active,
          category_id: parseInt(formData.category_id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update package' }));
        throw new Error(errorData.message || 'Failed to update package');
      }

      // Upload new attachments if any
      await uploadAttachments(editingPackage.package_id);

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        detailed_description: '',
        price: '',
        default_slots: 1,
        category_id: '',
        inclusions: [''],
      });
      setEditingPackage(null);
      setCurrentAttachments([]);
      
      // Refresh packages with current filters
      await fetchPackages(filters);
    } catch (err) {
      console.error('Update package error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update package');
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete package confirmation and execution
  const handleDeletePackage = (pkg: PackageResponse) => {
    showConfirmation({
      type: 'danger',
      title: 'Delete Package',
      message: `Are you sure you want to delete "${pkg.title}"?\n\nThis action cannot be undone. All associated bookings and data will be permanently removed.`,
      confirmText: 'Delete Package',
      cancelText: 'Keep Package',
      onConfirm: () => deletePackage(pkg.package_id),
    });
  };

  const deletePackage = async (packageId: number) => {
    setConfirmationLoading(true);
    setProcessingIds(prev => new Set([...prev, packageId]));
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete package' }));
        throw new Error(errorData.message || 'Failed to delete package');
      }
      
      console.log('Package deleted successfully, refreshing list...');
      
      // Wait a moment to ensure backend processing is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh packages from server with current filters
      await fetchPackages(filters);
      
      // Close confirmation modal
      closeConfirmation();
    } catch (err) {
      console.error('Delete package error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete package');
      setConfirmationLoading(false);
    } finally {
      // Remove from processing set
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
    }
  };

  // Toggle package status confirmation and execution
  const handleStatusToggle = (pkg: PackageResponse) => {
    const action = pkg.is_active ? 'deactivate' : 'activate';
    const consequence = pkg.is_active 
      ? 'This will hide the package from clients and prevent new bookings.'
      : 'This will make the package visible to clients for new bookings.';

    showConfirmation({
      type: pkg.is_active ? 'warning' : 'success',
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Package`,
      message: `Are you sure you want to ${action} "${pkg.title}"?\n\n${consequence}`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancel',
      onConfirm: () => togglePackageStatus(pkg),
    });
  };

  const togglePackageStatus = async (pkg: PackageResponse) => {
    const packageId = pkg.package_id;
    
    setConfirmationLoading(true);
    setProcessingIds(prev => new Set([...prev, packageId]));
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: pkg.title,
          description: pkg.description,
          detailed_description: pkg.detailed_description,
          price: pkg.price,
          default_slots: pkg.default_slots,
          is_active: !pkg.is_active,
          category_id: pkg.category_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update package status' }));
        throw new Error(errorData.message || 'Failed to update package status');
      }
      
      // Refresh packages with current filters
      await fetchPackages(filters);
      
      // Close confirmation modal
      closeConfirmation();
    } catch (err) {
      console.error('Toggle status error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update package status');
      setConfirmationLoading(false);
    } finally {
      // Remove from processing set
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
    }
  };

  // Handle form close confirmation
  const handleFormClose = () => {
    const hasUnsavedChanges = formData.title.trim() || 
                             formData.description.trim() || 
                             formData.detailed_description.trim() || 
                             formData.price.trim() || 
                             formData.category_id.trim() || 
                             formData.inclusions.some(inc => inc.trim()) ||
                             attachmentForm.files.length > 0 ||
                             attachmentForm.urls.filter(url => url.trim()).length > 0;

    if (hasUnsavedChanges) {
      showConfirmation({
        type: 'warning',
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to close without saving?',
        confirmText: 'Discard Changes',
        cancelText: 'Continue Editing',
        onConfirm: () => {
          resetFormAndClose();
        },
      });
    } else {
      resetFormAndClose();
    }
  };

  // Helper function to reset form and close modal
  const resetFormAndClose = () => {
    setShowCreateModal(false);
    setEditingPackage(null);
    setCurrentAttachments([]);
    setFormData({
      title: '',
      description: '',
      detailed_description: '',
      price: '',
      default_slots: 1,
      category_id: '',
      inclusions: [''],
    });
    setAttachmentForm({
      type: 'file',
      files: [],
      urls: [''],
      thumbnailIndex: -1
    });
    closeConfirmation();
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleFormClose();
    }
  };

  // Add inclusion to form
  const addInclusion = () => {
    setFormData(prev => ({
      ...prev,
      inclusions: [...prev.inclusions, '']
    }));
  };

  // Remove inclusion from form
  const removeInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  // Update inclusion in form
  const updateInclusion = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.map((inclusion, i) => i === index ? value : inclusion)
    }));
  };

  // Start editing package
  const startEditingPackage = (pkg: PackageResponse) => {
    setFormData({
      title: pkg.title,
      description: pkg.description,
      detailed_description: pkg.detailed_description || '',
      price: pkg.price.toString(),
      default_slots: pkg.default_slots,
      category_id: pkg.category_id.toString(),
      inclusions: pkg.inclusions?.map(inc => inc.inclusion_name) || [''],
    });
    setEditingPackage(pkg);
    fetchPackageAttachments(pkg.package_id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPackageImageUrl = (pkg: PackageResponse) => {
    if (pkg.attachments && pkg.attachments.length > 0) {
      // First try to find thumbnail, then any image
      let imageAttachment = pkg.attachments.find(att => att.is_thumbnail === true);
      if (!imageAttachment) {
        imageAttachment = pkg.attachments.find(att => 
          att.file_type === 'image' || att.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
      }
      
      if (imageAttachment) {
        const fileUrl = imageAttachment.file_url;
        
        // If it's an external URL (starts with http/https), use it directly
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
          return fileUrl;
        }
        
        // For uploaded files, construct the full URL
        // Remove '/api' from API_BASE_URL to get the server base URL
        const serverBaseUrl = API_BASE_URL.replace('/api', '');
        return `${serverBaseUrl}${fileUrl}`;
      }
    }
    return '/placeholder-image.jpg';
  };

  // Packages are now filtered server-side, so we use the full packages array
  const filteredPackages = packages;

  if (loading) {
    return (
      <DashboardLayout title="My Services" subtitle="Manage your wedding service packages">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          <span className="ml-2 text-gray-600">Loading packages...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="My Services"
      subtitle="Manage your wedding service packages and offerings"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {['all', 'active', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search packages..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            disabled={createLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Package
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const isProcessing = processingIds.has(pkg.package_id);
          
          return (
            <div 
              key={pkg.package_id} 
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-opacity ${
                isProcessing ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {/* Package Image */}
              <div className="h-48 bg-gray-200 relative">
                <img 
                  src={getPackageImageUrl(pkg)} 
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    onClick={() => handleStatusToggle(pkg)}
                    disabled={isProcessing}
                    className={`p-2 rounded-full shadow-md transition-colors ${
                      pkg.is_active 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={pkg.is_active ? 'Deactivate package' : 'Activate package'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePackage(pkg)}
                    disabled={isProcessing}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-4 left-4 flex space-x-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {pkg.category_name}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(pkg.is_active)}`}>
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Package Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                </div>

                {/* Package Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{pkg.completed_bookings || 0} bookings</span>
                    </div>
                    {(pkg.avg_rating && pkg.avg_rating > 0) && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                        <span>{pkg.avg_rating.toFixed(1)} ({pkg.total_reviews || 0})</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatPrice(pkg.price)}</p>
                  </div>
                </div>

                {/* Package Details */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Available Slots:</span> {pkg.default_slots}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {pkg.category_name}
                  </div>
                </div>

                {/* Inclusions */}
                {pkg.inclusions && pkg.inclusions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Inclusions:</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.inclusions.slice(0, 3).map((inclusion) => (
                        <span key={inclusion.inclusion_id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {inclusion.inclusion_name}
                        </span>
                      ))}
                      {pkg.inclusions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{pkg.inclusions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.open(`/services/${pkg.package_id}`, '_blank')}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button 
                    onClick={() => startEditingPackage(pkg)}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search 
              ? `No packages found matching "${filters.search}".` 
              : activeTab !== 'all' 
                ? `No ${activeTab} packages found.` 
                : 'Start by creating your first wedding service package.'}
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Package
          </button>
        </div>
      )}

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        type={confirmation.type}
        isLoading={confirmation.isLoading}
      />

      {/* Create/Edit Package Modal */}
      {(showCreateModal || editingPackage) && (
        <div 
          className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-start justify-center"
          onClick={handleBackdropClick}
        >
          <div 
            className="relative mt-10 mx-auto p-5 border-2 border-gray-200 w-full max-w-4xl shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </h3>
              <button 
                onClick={resetFormAndClose}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={editingPackage ? updatePackage : createPackage} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Package Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Short Description</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                    <textarea
                      rows={4}
                      value={formData.detailed_description}
                      onChange={(e) => setFormData({...formData, detailed_description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Provide a detailed description of your package..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price (PHP)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Available Slots</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.default_slots}
                        onChange={(e) => setFormData({...formData, default_slots: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Inclusions</label>
                    {formData.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={inclusion}
                          onChange={(e) => updateInclusion(index, e.target.value)}
                          placeholder="Enter inclusion description"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                        {formData.inclusions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInclusion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addInclusion}
                      className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                    >
                      + Add Inclusion
                    </button>
                  </div>
                </div>

                {/* Right Column - Images */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Package Images</h4>
                    
                    {/* Current Attachments (Edit Mode) */}
                    {editingPackage && currentAttachments.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                        <div className="grid grid-cols-2 gap-2">
                          {currentAttachments.map((attachment) => {
                            // Use the same URL construction logic
                            const getAttachmentUrl = (fileUrl: string) => {
                              if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
                                return fileUrl;
                              }
                              const serverBaseUrl = API_BASE_URL.replace('/api', '');
                              return `${serverBaseUrl}${fileUrl}`;
                            };

                            return (
                              <div key={attachment.attachment_id} className="relative">
                                <img
                                  src={getAttachmentUrl(attachment.file_url)}
                                  alt="Package attachment"
                                  className="w-full h-24 object-cover rounded border"
                                  onError={(e) => {
                                    console.error('Failed to load image:', attachment.file_url);
                                    e.currentTarget.src = '/placeholder-image.jpg';
                                  }}
                                />
                                <div className="absolute top-1 right-1 flex space-x-1">
                                  {attachment.is_thumbnail && (
                                    <span className="bg-green-500 text-white text-xs px-1 rounded flex items-center">
                                      <Check className="w-3 h-3" />
                                    </span>
                                  )}
                                  {!attachment.is_thumbnail && (
                                    <button
                                      type="button"
                                      onClick={() => setAsThumbnail(attachment.attachment_id)}
                                      className="bg-blue-500 text-white text-xs px-1 rounded hover:bg-blue-600"
                                      title="Set as thumbnail"
                                    >
                                      <Camera className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeAttachment(attachment.attachment_id)}
                                    className="bg-red-500 text-white text-xs px-1 rounded hover:bg-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Upload Type Toggle */}
                    <div className="flex space-x-1 bg-gray-100 rounded p-1 mb-4">
                      <button
                        type="button"
                        onClick={() => setAttachmentForm(prev => ({...prev, type: 'file'}))}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                          attachmentForm.type === 'file'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Upload className="w-4 h-4 inline mr-1" />
                        Upload Files
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachmentForm(prev => ({...prev, type: 'url'}))}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                          attachmentForm.type === 'url'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <ExternalLink className="w-4 h-4 inline mr-1" />
                        Add URLs
                      </button>
                    </div>

                    {/* File Upload */}
                    {attachmentForm.type === 'file' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Select Images</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelection}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                          />
                        </div>

                        {/* File Preview */}
                        {attachmentForm.files.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preview & Thumbnail Selection</label>
                            <div className="grid grid-cols-2 gap-2">
                              {attachmentForm.files.map((file, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-24 object-cover rounded border"
                                  />
                                  <div className="absolute top-1 right-1">
                                    <label className="flex items-center space-x-1 bg-white rounded px-1 text-xs">
                                      <input
                                        type="radio"
                                        name="thumbnail"
                                        checked={attachmentForm.thumbnailIndex === index}
                                        onChange={() => setAttachmentForm(prev => ({...prev, thumbnailIndex: index}))}
                                      />
                                      <span>Thumb</span>
                                    </label>
                                  </div>
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                    {file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* URL Input */}
                    {attachmentForm.type === 'url' && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Image URLs</label>
                        {attachmentForm.urls.map((url, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => handleUrlChange(index, e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            />
                            <label className="flex items-center space-x-1 text-sm">
                              <input
                                type="radio"
                                name="urlThumbnail"
                                checked={attachmentForm.thumbnailIndex === index}
                                onChange={() => setAttachmentForm(prev => ({...prev, thumbnailIndex: index}))}
                              />
                              <span>Thumb</span>
                            </label>
                            {attachmentForm.urls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeUrlInput(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addUrlInput}
                          className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                        >
                          + Add Another URL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetFormAndClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || attachmentLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {(createLoading || attachmentLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PlannerServices;