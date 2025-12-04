import { useNavigate } from "react-router-dom";
import {
  Star,
  MessageCircle,
  Phone,
  Award,
  Clock,
  Calendar,
  CalendarDays,
  Info,
  ChevronRight,
} from "lucide-react";
import AvailabilityPreview from "./AvailabilityPreview";
import type { Package } from "../../types/package";

interface ServiceSidebarProps {
  packageId: number;
  title: string;
  price: string;
  planner: Package['planner'];
  rating: number;
  reviewCount: number;
  defaultSlots: number;
}

const ServiceSidebar = ({
  packageId,
  title,
  price,
  planner,
  rating,
  reviewCount,
  defaultSlots,
}: ServiceSidebarProps) => {
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
    <div className="sticky top-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>

      <div className="mt-2">
        <p className="text-2xl font-bold text-pink-600">
          {price}
        </p>
      </div>

      {/* Planner Quick Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <img
            src={
              planner.profilePicture ||
              "/placeholder-avatar.jpg"
            }
            alt={planner.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {planner.name}
            </p>
            <p className="text-sm text-pink-600">
              {planner.businessName}
            </p>
            <div className="flex items-center mt-1">
              <div className="flex">
                {renderStars(planner.averageRating, "h-3 w-3")}
              </div>
              <span className="ml-1 text-xs text-gray-500">
                {planner.averageRating} ({planner.completedWeddings} weddings)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Package Rating */}
      <div className="mt-4">
        <div className="flex items-center">
          <div className="flex">
            {renderStars(rating)}
          </div>
          <p className="ml-2 text-sm text-gray-500">
            {rating} ({reviewCount} reviews)
          </p>
        </div>
      </div>

      {/* Availability Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <AvailabilityPreview
          packageId={packageId}
          defaultSlots={defaultSlots}
        />
      </div>

      {/* Book Now Button */}
      <div className="mt-6 space-y-4">
        <button
          onClick={() =>
            navigate(`/services/${packageId}/book`)
          }
          className="w-full border border-transparent rounded-lg py-3 px-6 flex items-center justify-center text-base font-medium transition-colors text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Check Availability & Book
        </button>

        <button
          onClick={() =>
            navigate(`/services/${packageId}/book`)
          }
          className="w-full border border-pink-600 rounded-lg py-2 px-4 flex items-center justify-center text-sm font-medium transition-colors text-pink-600 bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          View Full Calendar
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Contact Options */}
      {/* <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() =>
            alert(`Calling ${planner.business_phone}`)
          }
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Phone className="h-4 w-4 mr-2" />
          Call
        </button>
        <button
          onClick={() =>
            alert(`Opening chat with ${planner.businessName}`)
          }
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </button>
      </div> */}

      {/* Trust Indicators */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <Award className="h-5 w-5 text-green-600" />
          <span className="ml-2 text-sm font-medium text-green-800">
            Verified Wedding Planner
          </span>
        </div>
        <p className="mt-1 text-xs text-green-600">
          Background checked and insured professional
        </p>
      </div>

      {/* Response Time Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center text-blue-800">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            Usually responds within 2 hours
          </span>
        </div>
      </div>

      {/* Package Stats */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Default Availability:</span>
          <span className="font-medium text-gray-900">
            {defaultSlots} slot{defaultSlots !== 1 ? "s" : ""} per date
          </span>
        </div>
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <Info className="h-3 w-3 mr-1" />
          Some dates may have different slot allocations
        </div>
      </div>
    </div>
  );
};

export default ServiceSidebar;