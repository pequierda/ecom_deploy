import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ServiceHeader from "./ServiceHeader";
import ImageGallery from "./ImageGallery";
import ServiceTabs from "./ServiceTabs";
import ServiceSidebar from "./ServiceSidebar";
import type { Package } from "../../types/package";

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface ServiceDetailsWrapperProps {
  currentPackage: Package;
}

const ServiceDetailsWrapper = ({ currentPackage }: ServiceDetailsWrapperProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Early return with loading state if currentPackage is not available
  if (!currentPackage) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Handle back navigation with smart fallback
  const handleBack = () => {
    // Check if we have state from previous navigation
    const fromPath = location.state?.from;
    
    if (fromPath) {
      navigate(fromPath);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Smart fallback based on current context
      const searchParams = new URLSearchParams(location.search);
      const category = searchParams.get('category');
      
      if (category) {
        navigate(`/services?category=${category}`);
      } else {
        navigate('/services');
      }
    }
  };

  // Generate breadcrumb items (without back button)
  const generateBreadcrumb = (): BreadcrumbItem[] => {
    try {
      const items: BreadcrumbItem[] = [
        {
          label: "Home",
          onClick: () => navigate("/", { state: { from: location.pathname } }),
        },
        {
          label: "Services",
          onClick: () => navigate("/services", { state: { from: location.pathname } }),
        },
      ];

      // Add category breadcrumb if available
      if (currentPackage.category && currentPackage.category.name) {
        items.push({
          label: currentPackage.category.name,
          onClick: () => navigate(`/services?category=${currentPackage.category.name}`, { 
            state: { from: location.pathname } 
          }),
        });
      }

      // Add current package title
      if (currentPackage.title) {
        items.push({
          label: currentPackage.title,
        });
      }

      return items;
    } catch (error) {
      console.error('Error generating breadcrumb:', error);
      return [
        {
          label: "Home",
          onClick: () => navigate("/"),
        },
        {
          label: "Services",
          onClick: () => navigate("/services"),
        },
      ];
    }
  };

  const breadcrumbItems = generateBreadcrumb();

  // Get dynamic back label based on where user came from
  const getBackLabel = () => {
    const fromPath = location.state?.from;
    if (fromPath) {
      if (fromPath.includes('/services')) return "Back to Services";
      if (fromPath === '/') return "Back to Home";
      if (fromPath.includes('/search')) return "Back to Search";
    }
    return "Back";
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium text-sm sm:text-base">
              {getBackLabel()}
            </span>
          </button>
        </div>

        {/* Responsive Scrollable Breadcrumb */}
        <ServiceHeader breadcrumbItems={breadcrumbItems} />

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Image gallery and tabs */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            {currentPackage.images && (
              <ImageGallery
                images={currentPackage.images}
                thumbnail={currentPackage.thumbnail || "/placeholder-image.jpg"}
                title={currentPackage.title || "Service Package"}
              />
            )}

            {/* Service Tabs */}
            <ServiceTabs
              description={currentPackage.description || ""}
              detailedDescription={currentPackage.detailedDescription}
              inclusions={currentPackage.inclusions}
              category={currentPackage.category}
              rating={currentPackage.rating || 0}
              reviewCount={currentPackage.reviewCount || 0}
              reviews={currentPackage.reviews}
              planner={currentPackage.planner}
            />
          </div>

          {/* Right Column - Package info and booking */}
          <div className="mt-8 lg:mt-0">
            <ServiceSidebar
              packageId={currentPackage.id}
              title={currentPackage.title || "Service Package"}
              price={String(currentPackage.price ?? "0")}
              planner={currentPackage.planner}
              rating={currentPackage.rating || 0}
              reviewCount={currentPackage.reviewCount || 0}
              defaultSlots={currentPackage.defaultSlots}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsWrapper;