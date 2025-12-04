import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import type { Package } from "../../types/package";

interface ServiceTabsProps {
  description: string;
  detailedDescription: string;
  inclusions: string[];
  category: Package['category'];
  rating: number;
  reviewCount: number;
  reviews: Package['reviews'];
  planner: Package['planner'];
}

const ServiceTabs = ({
  description,
  detailedDescription,
  inclusions,
  category,
  rating,
  reviewCount,
  reviews,
  planner,
}: ServiceTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const renderStars = (rating: number, size: string = "h-5 w-5") => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} ${
          rating > index ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="mt-8">
      {/* Tab Navigation */}
      <nav className="flex space-x-8" aria-label="Tabs">
        {[
          { id: "overview", name: "Overview" },
          { id: "reviews", name: "Reviews" },
          { id: "planner", name: "About Planner" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Package Description
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {detailedDescription || description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">
                What's Included
              </h3>
              <ul className="mt-4 space-y-2">
                {inclusions.map((inclusion, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600">
                      {inclusion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Package Category Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Category
              </h3>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                {category.name}
              </div>
              {category.description && (
                <p className="mt-2 text-gray-600 text-sm">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Customer Reviews
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(rating, "h-4 w-4")}
                </div>
                <span className="text-sm text-gray-500">
                  {rating} ({reviewCount} reviews)
                </span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No reviews yet.
              </p>
            ) : (
              <div className="space-y-6">
                {/* Show only first 3 reviews */}
                {reviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 pb-6 last:border-b-0"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="text-pink-600 font-medium text-sm">
                            {review.author.split(" ")[0][0]}
                            {review.author.split(" ")[1]
                              ? review.author.split(" ")[1][0]
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {review.author}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Wedding Date: {review.weddingDate}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(review.rating, "h-4 w-4")}
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.date}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* "View All Reviews" button that navigates to reviews page */}
                {reviews.length === 3 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() =>
                        navigate(`/planner/${planner.id}/reviews`)
                      }
                      className="inline-flex items-center px-4 py-2 border border-pink-300 rounded-lg text-sm font-medium text-pink-600 bg-white hover:bg-pink-50 transition-colors"
                    >
                      View All {reviewCount} Reviews
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "planner" && (
          <div className="space-y-6">
            {/* Planner Profile */}
            <div className="flex items-start space-x-4">
              <img
                src={
                  planner.profilePicture ||
                  "/placeholder-avatar.jpg"
                }
                alt={planner.name}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {planner.name}
                </h3>
                <p className="text-lg text-pink-600 font-medium">
                  {planner.businessName}
                </p>
                <div className="flex items-center mt-1 space-x-4">
                  <div className="flex items-center">
                    <div className="flex">
                      {renderStars(planner.averageRating, "h-4 w-4")}
                    </div>
                    <span className="ml-1 text-sm text-gray-500">
                      {planner.averageRating}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {planner.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">
                  {planner.completedWeddings}
                </div>
                <div className="text-sm text-gray-600">
                  Weddings Completed
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {planner.experienceYears}
                </div>
                <div className="text-sm text-gray-600">
                  Years Experience
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {planner.totalReviews}
                </div>
                <div className="text-sm text-gray-600">
                  Total Reviews
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                About
              </h4>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {planner.bio}
              </p>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900">
                Contact Information
              </h4>
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3" />
                  {planner.business_phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3" />
                  {planner.business_email}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceTabs;