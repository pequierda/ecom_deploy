import { useState, useEffect } from 'react';
import { Star, Filter, X, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePackages, useCategories, useCurrentPackage } from '../stores/packageStore';
import type { PackageSearchParams } from '../types/package';

const sortOptions = [
  { id: 'created_at', name: 'Newest First', active: false },
  { id: 'price_low', name: 'Price: Low to High', active: false },
  { id: 'price_high', name: 'Price: High to Low', active: false },
  { id: 'rating', name: 'Rating', active: true },
  { id: 'popular', name: 'Most Popular', active: false },
];

const WeddingPackagesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSort, setSelectedSort] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);

  // Zustand store hooks
  const { packages, loading, error, pagination, searchPackages } = usePackages();
  const { categories, categoriesLoading, categoriesError, fetchCategories } = useCategories();
  const { setCurrentPackage } = useCurrentPackage();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Set default category (first available category) when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      // Set the first category as default, or you can set based on a specific category name
      const defaultCategory = categories.find(cat => cat.name.toLowerCase() === 'venues') || categories[0];
      if (defaultCategory) {
        setSelectedCategories([defaultCategory.category_id]);
      }
    }
  }, [categories, selectedCategories.length]);

  // Fetch packages on component mount and when filters change
  useEffect(() => {
    if (categories.length > 0) { // Only search when categories are loaded
      const params: PackageSearchParams = {
        search: searchQuery,
        categories: selectedCategories.join(','),
        sortBy: selectedSort as any,
        sortOrder: 'DESC',
        page: currentPage,
        limit: 12,
      };

      searchPackages(params);
    }
  }, [searchQuery, selectedCategories, selectedSort, currentPage, searchPackages, categories.length]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    const params: PackageSearchParams = {
      search: searchQuery,
      categories: selectedCategories.join(','),
      sortBy: selectedSort as any,
      sortOrder: 'DESC',
      page: 1,
      limit: 12,
    };
    searchPackages(params);
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      return newCategories;
    });
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
    setCurrentPage(1);
  };

  // Handle vendor click
  const handleVendorClick = (plannerId: number) => {
    alert(`Navigate to vendor profile: ${plannerId}`);
  };

  // Handle package click - use store instead of URL params
  const handlePackageClick = (packageItem: any) => {
    // Set the current package in the store
    setCurrentPackage(packageItem);
    // Navigate to details page without passing the ID as URL param
    navigate(`/services/${packageItem.id}`);
  };

  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          rating > index ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Discover Amazing</span>
              <span className="block text-pink-600">Wedding Packages</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Browse wedding packages from our trusted wedding planners and vendors in Kidapawan City
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Connect with verified wedding professionals for your special day
            </p>
          </div>
        </div>
      </div>

      {/* Modern Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col space-y-4">
          {/* Modern Compact Search */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search wedding packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-pink-500 focus:border-pink-500 text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-pink-600 text-white p-1 rounded-full hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Chips - Categories Loading State */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center bg-pink-100 text-pink-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <Filter className="h-4 w-4 mr-1" />
              Filters:
            </div>

            {/* Categories Loading State */}
            {categoriesLoading && (
              <div className="flex items-center bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Loading categories...
              </div>
            )}

            {/* Categories Error State */}
            {categoriesError && (
              <div className="flex items-center bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-sm">
                Error loading categories
              </div>
            )}

            {/* Dynamic Categories from Database */}
            {!categoriesLoading && !categoriesError && categories.map((category) => (
              <button
                key={category.category_id}
                onClick={() => handleCategoryToggle(category.category_id)}
                className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(category.category_id)
                    ? 'bg-pink-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.name}
                {selectedCategories.includes(category.category_id) && (
                  <X className="h-4 w-4 ml-1" />
                )}
              </button>
            ))}
          </div>

          {/* Sort Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
              Sort by:
            </div>
            
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSortChange(option.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedSort === option.id
                    ? 'bg-pink-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading packages
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wedding Packages Grid */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {pagination?.totalItems ? `${pagination.totalItems} Wedding Packages` : 'Wedding Packages'}
            </h2>
            <button 
              onClick={() => alert('Navigate to all vendors page')}
              className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
            >
              Browse All Vendors →
            </button>
          </div>
          
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No packages found matching your criteria.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {packages.map((packageItem) => (
                <div 
                  key={packageItem.id} 
                  className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-pink-200"
                >
                  {/* Image */}
                  <div className="aspect-w-16 aspect-h-9 w-full h-48 overflow-hidden">
                    <img
                      src={packageItem.thumbnail || packageItem.images[0] || '/placeholder-image.jpg'}
                      alt={packageItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2 leading-tight">
                        <button 
                          onClick={() => handlePackageClick(packageItem)}
                          className="hover:text-pink-600 transition-colors text-left"
                        >
                          {packageItem.title}
                        </button>
                      </h3>
                      <p className="text-lg font-bold text-pink-600 whitespace-nowrap">
                        {packageItem.price}
                      </p>
                    </div>

                    {/* Wedding Planner Info */}
                    <div className="flex items-center mb-3 group/vendor">
                      <img
                        src={packageItem.planner.profilePicture || '/placeholder-avatar.jpg'}
                        alt={packageItem.planner.name}
                        className="w-6 h-6 rounded-full object-cover mr-2 ring-2 ring-transparent group-hover/vendor:ring-pink-200 transition-all"
                      />
                      <button 
                        onClick={() => handleVendorClick(packageItem.planner.id)}
                        className="text-sm text-gray-500 hover:text-pink-600 italic transition-colors duration-200 flex items-center"
                      >
                        by {packageItem.planner.businessName}
                      </button>
                    </div>
                    
                    {/* Truncated Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {packageItem.description}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex space-x-1">
                        {renderStars(packageItem.rating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {packageItem.rating} ({packageItem.reviewCount} reviews)
                      </span>
                    </div>
                    
                    {/* Docked Button - Modified to use store navigation */}
                    <div className="mt-auto">
                      <button
                        onClick={() => handlePackageClick(packageItem)}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-all duration-300 hover:shadow-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      >
                        View Package Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Call to Action for Vendors */}
      <div className="bg-gradient-to-r from-gray-50 to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Are You a Wedding Professional?
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our platform and showcase your wedding packages to couples across Kidapawan City
          </p>
          <button
            onClick={() => alert('Navigate to vendor registration')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 hover:shadow-md"
          >
            Become a Vendor
          </button>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 pt-6">
            <div className="-mt-px flex w-0 flex-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium transition-colors ${
                  pagination.hasPrev 
                    ? 'text-gray-500 hover:border-gray-300 hover:text-gray-700' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <svg
                  className="mr-3 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z"
                    clipRule="evenodd"
                  />
                </svg>
                Previous
              </button>
            </div>
            <div className="hidden md:-mt-px md:flex">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <div className="-mt-px flex w-0 flex-1 justify-end">
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium transition-colors ${
                  pagination.hasNext 
                    ? 'text-gray-500 hover:border-gray-300 hover:text-gray-700' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                Next
                <svg
                  className="ml-3 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default WeddingPackagesPage;