import { useState, useEffect } from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { usePackagePreparationDays } from "../../stores/packageStore";
import type { DateAvailability, UpcomingAvailabilityResponse } from "../../types/package";

interface AvailabilityPreviewProps {
  packageId: number;
  defaultSlots: number;
  preparationDays?: number;
}

const AvailabilityPreview = ({
  packageId,
  defaultSlots,
  preparationDays = 0,
}: AvailabilityPreviewProps) => {
  const [upcomingAvailability, setUpcomingAvailability] = useState<
    UpcomingAvailabilityResponse | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchUpcomingAvailability } = usePackagePreparationDays();

  useEffect(() => {
    const fetchUpcomingDates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching upcoming availability for package:', packageId);

        const availabilityData = await fetchUpcomingAvailability(
          packageId,
          30, // Next 30 days
          7   // Up to 7 dates
        );

        setUpcomingAvailability(availabilityData);
        console.log('📅 Fetched upcoming availability:', availabilityData);
      } catch (error) {
        console.error("Error fetching availability preview:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch availability");
        setUpcomingAvailability(null);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchUpcomingDates();
    }
  }, [packageId, fetchUpcomingAvailability]);

  const formatPreviewDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00"); // Ensure timezone consistency
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getAvailabilityColor = (availability: DateAvailability) => {
    if (availability.isBlocked) {
      if (availability.isPreparationPeriod) {
        return "text-orange-600 bg-orange-50 border-orange-200";
      }
      return "text-red-600 bg-red-50 border-red-200";
    }
    
    const percentage = availability.availableSlots / availability.totalSlots;
    if (percentage >= 0.7) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 0.3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  const getAvailabilityIcon = (availability: DateAvailability) => {
    if (availability.isBlocked) {
      if (availability.isPreparationPeriod) {
        return <Clock className="h-3 w-3" />;
      }
      return <AlertTriangle className="h-3 w-3" />;
    }
    if (availability.available && availability.availableSlots > 0) {
      return <CheckCircle className="h-3 w-3" />;
    }
    return <AlertTriangle className="h-3 w-3" />;
  };

  const getAvailabilityText = (availability: DateAvailability) => {
    if (availability.isBlocked) {
      if (availability.isPreparationPeriod) {
        return "Prep";
      }
      return "N/A";
    }
    return `${availability.availableSlots}/${availability.totalSlots}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mt-3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-2" />
        <div className="text-sm text-red-600 mb-2">Failed to load availability</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <h5 className="text-sm font-medium text-gray-700">
            Upcoming Availability
          </h5>
        </div>
        <span className="text-xs text-gray-500">
          Default: {defaultSlots} slot{defaultSlots !== 1 ? 's' : ''}/date
        </span>
      </div>

      {/* Preparation Days Info */}
      {preparationDays > 0 && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-xs text-blue-700">
            <Clock className="h-3 w-3" />
            <span>
              {preparationDays} preparation day{preparationDays !== 1 ? 's' : ''} after each booking
            </span>
          </div>
        </div>
      )}

      {upcomingAvailability && upcomingAvailability.upcomingDates.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {upcomingAvailability.upcomingDates.slice(0, 4).map(({ date, availability }) => (
            <div key={date} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {formatPreviewDate(date)}
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-lg border flex items-center justify-center space-x-1 min-h-[32px] ${getAvailabilityColor(
                  availability
                )}`}
                title={
                  availability.isPreparationPeriod
                    ? "Preparation period - not available"
                    : availability.reason || 
                      `${availability.availableSlots} of ${availability.totalSlots} slots available`
                }
              >
                {getAvailabilityIcon(availability)}
                <span className="font-medium">
                  {getAvailabilityText(availability)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-500 mb-1">
            No availability in next 30 days
          </div>
          <div className="text-xs text-gray-400">
            Check calendar for more dates
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 space-y-2">
        <div className="text-xs font-medium text-gray-700 mb-2">Legend:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded flex items-center justify-center">
              <CheckCircle className="h-2 w-2 text-green-600" />
            </div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-center">
              <CheckCircle className="h-2 w-2 text-yellow-600" />
            </div>
            <span className="text-gray-600">Limited</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded flex items-center justify-center">
              <Clock className="h-2 w-2 text-orange-600" />
            </div>
            <span className="text-gray-600">Prep Period</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded flex items-center justify-center">
              <AlertTriangle className="h-2 w-2 text-red-600" />
            </div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <div>
          Availability varies by date and bookings.
        </div>
        {preparationDays > 0 && (
          <div className="text-blue-600">
            Dates marked "Prep" are blocked for preparation after confirmed bookings.
          </div>
        )}
        <div>
          Click package for detailed calendar view.
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPreview;