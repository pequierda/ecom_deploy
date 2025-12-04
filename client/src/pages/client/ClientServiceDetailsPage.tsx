import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentPackage } from "../../stores/packageStore";
import ServiceDetailsWrapper from "../../components/servicedetails";
import DashboardLayout from '../../components/DashboardLayout';

const ClientServiceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<
    "details" | "booking" | "payment" | "confirmation"
  >("details");

  // Zustand store hooks
  const {
    currentPackage,
    loading,
    error,
    fetchPackageById,
    clearCurrentPackage,
  } = useCurrentPackage();

  // Load package data - use store first, then fallback to API if needed
  useEffect(() => {
    const packageId = Number(id);

    if (!packageId || isNaN(packageId)) {
      navigate("/services");
      return;
    }

    // Always fetch the package by ID - this ensures fresh data
    fetchPackageById(packageId);
  }, [id, fetchPackageById, navigate]);

  // Separate useEffect for cleanup when component unmounts
  useEffect(() => {
    return () => {
      clearCurrentPackage();
    };
  }, [clearCurrentPackage]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading package details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Error Loading Package</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/services")}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Back to Packages
              </button>
              <button
                onClick={() => {
                  clearCurrentPackage();
                  const packageId = Number(id);
                  if (packageId && !isNaN(packageId)) {
                    fetchPackageById(packageId);
                  }
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // No package found
  if (!currentPackage) {
    return (
      <DashboardLayout>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-xl mb-4">Package Not Found</div>
            <p className="text-gray-600 mb-4">
              The package you're looking for doesn't exist or couldn't be loaded.
            </p>
            <button
              onClick={() => navigate("/services")}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Back to Packages
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Package Details Page - using the wrapper component
  if (currentStep === "details") {
    return (
      <DashboardLayout>
        <ServiceDetailsWrapper currentPackage={currentPackage} />
      </DashboardLayout>
    );
  }

  // Handle other steps (booking, payment, confirmation) if needed
  // You can add other step components here when you implement them
  switch (currentStep) {
    case "booking":
      return (
        <DashboardLayout>
          <div>Booking step - to be implemented</div>
        </DashboardLayout>
      );
    case "payment":
      return (
        <DashboardLayout>
          <div>Payment step - to be implemented</div>
        </DashboardLayout>
      );
    case "confirmation":
      return (
        <DashboardLayout>
          <div>Confirmation step - to be implemented</div>
        </DashboardLayout>
      );
    default:
      return (
        <DashboardLayout>
          <ServiceDetailsWrapper currentPackage={currentPackage} />
        </DashboardLayout>
      );
  }
};

export default ClientServiceDetailsPage;