import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  AlertCircle,
  Heart,
  Info,
  CalendarDays,
  CreditCard,
  Upload,
  QrCode,
  Banknote,
  Smartphone,
  Clock,
  Ban,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCurrentPackage,
  usePackageAvailability,
  usePackagePreparationDays, // NEW: Add preparation days hook
} from "../stores/packageStore";
import {
  useBookingForm,
  useBookingFlow,
  useBookingValidation,
} from "../stores/bookingStore";
import type { DateAvailability, PaymentInfo } from "../types/package";
import { useAuthStore } from "../stores/authStore";

// Mock payment information (in real app, this would come from planner's profile)
const mockPaymentInfo: PaymentInfo = {
  gcash: {
    number: "09123456789",
    qrCodeUrl: "/api/qr/gcash/09123456789", // This would be generated QR code
    accountName: "Juan Dela Cruz Wedding Services",
  },
  maya: {
    number: "09987654321",
    qrCodeUrl: "/api/qr/maya/09987654321", // This would be generated QR code
    accountName: "Juan Dela Cruz Wedding Services",
  },
  bankTransfer: {
    bankName: "BPI",
    accountNumber: "1234-5678-90",
    accountName: "Juan Dela Cruz Wedding Services",
  },
};

const PaymentMethodSelector = ({
  selectedMethod,
  onMethodSelect,
  paymentAmount,
  onReceiptUpload,
  receiptPreview,
  paymentInfo,
}: {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  paymentAmount: number;
  onReceiptUpload: (file: File) => void;
  receiptPreview: string;
  paymentInfo: PaymentInfo;
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onReceiptUpload(file);
    } else {
      alert("Please upload an image file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const PaymentMethodCard = ({
    method,
    icon,
    title,
    description,
    details,
  }: {
    method: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    details: React.ReactNode;
  }) => (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        selectedMethod === method
          ? "border-pink-500 bg-pink-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onMethodSelect(method)}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div
          className={`p-2 rounded-lg ${
            selectedMethod === method
              ? "bg-pink-100 text-pink-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {selectedMethod === method && (
        <div className="mt-4 pt-4 border-t border-pink-200">{details}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Select Payment Method
        </h3>
        <div className="text-2xl font-bold text-pink-600 mb-4">
          Amount to Pay: ₱{paymentAmount.toLocaleString()}
        </div>

        <div className="space-y-4">
          <PaymentMethodCard
            method="gcash"
            icon={<Smartphone className="h-5 w-5" />}
            title="GCash"
            description="Pay using GCash e-wallet"
            details={
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">GCash QR Code</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Scan to pay ₱{paymentAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>GCash Number:</strong>{" "}
                        {paymentInfo.gcash.number}
                      </p>
                      <p>
                        <strong>Account Name:</strong>{" "}
                        {paymentInfo.gcash.accountName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                  <p>
                    <strong>Instructions:</strong>
                  </p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Open your GCash app</li>
                    <li>
                      Scan the QR code above OR send to{" "}
                      {paymentInfo.gcash.number}
                    </li>
                    <li>Enter amount: ₱{paymentAmount.toLocaleString()}</li>
                    <li>Complete the payment</li>
                    <li>Take a screenshot of your receipt</li>
                    <li>Upload the receipt below</li>
                  </ol>
                </div>
              </div>
            }
          />

          <PaymentMethodCard
            method="maya"
            icon={<CreditCard className="h-5 w-5" />}
            title="Maya (PayMaya)"
            description="Pay using Maya e-wallet"
            details={
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Maya QR Code</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Scan to pay ₱{paymentAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Maya Number:</strong> {paymentInfo.maya.number}
                      </p>
                      <p>
                        <strong>Account Name:</strong>{" "}
                        {paymentInfo.maya.accountName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                  <p>
                    <strong>Instructions:</strong>
                  </p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Open your Maya app</li>
                    <li>
                      Scan the QR code above OR send to{" "}
                      {paymentInfo.maya.number}
                    </li>
                    <li>Enter amount: ₱{paymentAmount.toLocaleString()}</li>
                    <li>Complete the payment</li>
                    <li>Take a screenshot of your receipt</li>
                    <li>Upload the receipt below</li>
                  </ol>
                </div>
              </div>
            }
          />

          <PaymentMethodCard
            method="bank_transfer"
            icon={<Banknote className="h-5 w-5" />}
            title="Bank Transfer"
            description="Direct bank transfer or deposit"
            details={
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h5 className="font-medium mb-3">Bank Account Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium">
                        {paymentInfo.bankTransfer.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-medium font-mono">
                        {paymentInfo.bankTransfer.accountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium">
                        {paymentInfo.bankTransfer.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-pink-600">
                        ₱{paymentAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-purple-600 bg-purple-50 p-3 rounded">
                  <p>
                    <strong>Instructions:</strong>
                  </p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>
                      Transfer ₱{paymentAmount.toLocaleString()} to the account
                      above
                    </li>
                    <li>Use your name as reference/memo</li>
                    <li>Keep your bank receipt or transaction confirmation</li>
                    <li>Upload the receipt below</li>
                  </ol>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {selectedMethod && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Upload Payment Receipt
          </h4>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-pink-400 bg-pink-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {receiptPreview ? (
              <div className="space-y-4">
                <img
                  src={receiptPreview}
                  alt="Payment receipt"
                  className="max-w-xs mx-auto rounded-lg shadow-md"
                />
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Receipt uploaded successfully!
                  </p>
                  <button
                    onClick={() =>
                      document.getElementById("receipt-upload")?.click()
                    }
                    className="mt-2 text-sm text-pink-600 hover:text-pink-700"
                  >
                    Change receipt
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Upload your payment receipt
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag and drop your receipt image here, or click to browse
                  </p>
                </div>
                <button
                  onClick={() =>
                    document.getElementById("receipt-upload")?.click()
                  }
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </button>
              </div>
            )}

            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Supported formats: JPG, PNG, GIF. Max file size: 5MB
          </p>
        </div>
      )}
    </div>
  );
};

// UPDATED BookingCalendar with preparation days support
const BookingCalendar = ({
  selectedDate,
  onDateSelect,
  packageId,
  defaultSlots,
  preparationDays = 0, // NEW: Add preparation days prop
  className = "",
}: {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  packageId: number;
  defaultSlots: number;
  preparationDays?: number; // NEW: Preparation days prop
  className?: string;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<
    Record<string, DateAvailability>
  >({});
  const [loading, setLoading] = useState(false);
  const [selectedDateDetails, setSelectedDateDetails] =
    useState<DateAvailability | null>(null);

  // Use the availability hook
  const { fetchAvailabilityRange, fetchDateAvailability } =
    usePackageAvailability();

  // Get dates in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Format date to YYYY-MM-DD without timezone conversion
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if date is today (use local date comparison)
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // Check if date is in the past (use local date comparison)
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return compareDate.getTime() < today.getTime();
  };

  // Check if date is available for booking
  const isDateAvailable = (date: Date) => {
    // Can't book past dates or today's date
    if (isPastDate(date) || isToday(date)) {
      return false;
    }

    // Check availability data
    const dateStr = formatDate(date);
    const dayAvailability = availabilityData[dateStr];
    if (!dayAvailability) return true; // Default to available if no data

    // Check if date is blocked (including preparation periods)
    if (dayAvailability.isBlocked) return false;

    // Check if slots are available
    return dayAvailability.available && dayAvailability.availableSlots > 0;
  };

  // Get availability info for date
  const getDateAvailability = (date: Date): DateAvailability => {
    const dateStr = formatDate(date);
    const dayAvailability = availabilityData[dateStr];

    if (!dayAvailability) {
      return {
        totalSlots: defaultSlots,
        bookedSlots: 0,
        availableSlots: defaultSlots,
        available: true,
        isBlocked: false,
        isPreparationPeriod: false, // NEW: Default to false
      };
    }

    return dayAvailability;
  };

  // UPDATED: Get display status for date with preparation period handling
  const getDateStatus = (date: Date) => {
    // Check if date is today
    if (isToday(date)) return "today";
    
    // Check if date is in the past
    if (isPastDate(date)) return "past";

    const availability = getDateAvailability(date);

    // NEW: Handle preparation periods specifically
    if (availability.isPreparationPeriod) return "preparation";
    if (availability.isBlocked) return "blocked";
    if (availability.availableSlots === 0) return "full";
    if (availability.availableSlots <= Math.ceil(availability.totalSlots * 0.2))
      return "limited";
    return "available";
  };

  // Fetch availability data for current month
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Get first and last day of the month using local dates
        const startDate = formatDate(new Date(year, month, 1));
        const endDate = formatDate(new Date(year, month + 1, 0));

        console.log('🔍 Fetching availability for range:', { startDate, endDate, preparationDays });

        const availability = await fetchAvailabilityRange(
          packageId,
          startDate,
          endDate
        );
        setAvailabilityData(availability);
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailabilityData({});
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchAvailability();
    }
  }, [currentMonth, packageId, fetchAvailabilityRange]);

  // Fetch details for selected date
  useEffect(() => {
    const fetchSelectedDateDetails = async () => {
      if (selectedDate) {
        try {
          const details = await fetchDateAvailability(packageId, selectedDate);
          setSelectedDateDetails(details);
        } catch (error) {
          console.error("Error fetching selected date details:", error);
          setSelectedDateDetails(null);
        }
      } else {
        setSelectedDateDetails(null);
      }
    };

    if (selectedDate && packageId) {
      fetchSelectedDateDetails();
    }
  }, [selectedDate, packageId, fetchDateAvailability]);

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // UPDATED: Status colors with preparation period styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-50 border-green-200 hover:bg-green-100 text-green-800";
      case "limited":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-800";
      case "full":
        return "bg-red-50 border-red-200 text-red-600 cursor-not-allowed";
      case "preparation": // NEW: Preparation period styling
        return "bg-orange-50 border-orange-200 text-orange-600 cursor-not-allowed";
      case "blocked":
        return "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed";
      case "past":
        return "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed";
      case "today":
        return "bg-blue-50 border-blue-200 text-blue-600 cursor-not-allowed";
      default:
        return "bg-white border-gray-200 hover:bg-gray-50";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Selected Date Details - UPDATED with preparation period info */}
      {selectedDate && selectedDateDetails && (
        <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-pink-800">
              {(() => {
                const [year, month, day] = selectedDate.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              })()}
            </h4>
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-pink-700">
                {selectedDateDetails.availableSlots}/
                {selectedDateDetails.totalSlots} slots available
              </span>
            </div>
          </div>
          <div className="w-full bg-pink-200 rounded-full h-2">
            <div
              className="bg-pink-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (selectedDateDetails.availableSlots /
                    selectedDateDetails.totalSlots) *
                  100
                }%`,
              }}
            ></div>
          </div>
          {selectedDateDetails.isPreparationPeriod && (
            <p className="mt-2 text-sm text-orange-600 flex items-center">
              <Clock className="h-4 w-4 inline mr-1" />
              This date is in a preparation period for another booking
            </p>
          )}
          {selectedDateDetails.isBlocked && !selectedDateDetails.isPreparationPeriod && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              {selectedDateDetails.reason || "This date is not available"}
            </p>
          )}
        </div>
      )}

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-2"></div>
            <p className="text-sm text-gray-500">Loading availability...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 mb-6">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-16"></div>;
            }

            const dateStr = formatDate(day);
            const isSelected = selectedDate === dateStr;
            const availability = getDateAvailability(day);
            const status = getDateStatus(day);
            const isTodayDate = isToday(day);
            const canSelect = isDateAvailable(day);

            // Handle date click with preparation period messaging
            const handleDateClick = () => {
              if (canSelect) {
                console.log('📅 Date clicked:', {
                  dayNumber: day.getDate(),
                  dateStr,
                  selectedDate
                });
                onDateSelect(dateStr);
              } else if (isTodayDate) {
                alert("Please select a future date. Same-day bookings are not allowed.");
              } else if (availability.isPreparationPeriod) {
                alert(`This date is blocked due to a ${preparationDays}-day preparation period following another confirmed booking.`);
              } else if (availability.isBlocked) {
                alert(availability.reason || "This date is not available for booking.");
              }
            };

            // Enhanced tooltip messages
            const getTooltip = () => {
              if (isTodayDate) {
                return "Today is not available for booking. Please select a future date.";
              }
              if (isPastDate(day)) {
                return "Past dates are not available for booking.";
              }
              if (availability.isPreparationPeriod) {
                return `Preparation period (${preparationDays} days) following another booking`;
              }
              if (availability.isBlocked) {
                return availability.reason || "Date not available";
              }
              return `${availability.availableSlots} of ${availability.totalSlots} slots available`;
            };

            return (
              <button
                key={index}
                onClick={handleDateClick}
                disabled={!canSelect}
                className={`
                  h-16 w-full text-sm rounded-lg border-2 transition-all relative
                  ${
                    isSelected
                      ? "bg-pink-600 text-white border-pink-600 shadow-lg"
                      : getStatusColor(status)
                  }
                  ${isTodayDate && !isSelected ? "ring-2 ring-blue-400" : ""}
                  ${!canSelect ? "opacity-75" : ""}
                `}
                title={getTooltip()}
              >
                <div className="flex flex-col items-center justify-center h-full p-1">
                  <span
                    className={`font-semibold ${
                      isSelected ? "text-white" : ""
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {isTodayDate && (
                    <span className="text-xs text-blue-600 font-medium mt-1">
                      Today
                    </span>
                  )}

                  {/* Status indicators */}
                  {!availability.isBlocked && 
                   status !== "past" && 
                   status !== "today" && (
                    <div
                      className={`text-xs mt-1 flex items-center space-x-1 ${
                        isSelected ? "text-pink-200" : ""
                      }`}
                    >
                      {availability.availableSlots > 0 ? (
                        <>
                          <span
                            className={`font-medium ${
                              status === "limited"
                                ? "text-yellow-700"
                                : status === "available"
                                ? "text-green-700"
                                : "text-gray-600"
                            }`}
                          >
                            {availability.availableSlots}
                          </span>
                          <span
                            className={
                              isSelected ? "text-pink-200" : "text-gray-400"
                            }
                          >
                            /{availability.totalSlots}
                          </span>
                        </>
                      ) : (
                        <span className="text-red-600 font-medium">Full</span>
                      )}
                    </div>
                  )}

                  {/* Special status indicators */}
                  {availability.isPreparationPeriod && (
                    <div className="flex items-center space-x-1 text-xs text-orange-600 font-medium mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Prep</span>
                    </div>
                  )}

                  {availability.isBlocked && !availability.isPreparationPeriod && (
                    <span className="text-xs text-red-500 font-medium flex items-center space-x-1 mt-1">
                      <Ban className="h-3 w-3" />
                      <span>N/A</span>
                    </span>
                  )}

                  {status === "past" && !isTodayDate && (
                    <span className="text-xs text-gray-400">Past</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* UPDATED Legend with preparation period */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-700">
          Availability Legend:
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
            <span className="text-gray-600">Available (3+ slots)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
            <span className="text-gray-600">Limited (1-2 slots)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
            <span className="text-gray-600">Fully Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded mr-2 flex items-center justify-center">
              <Clock className="h-2 w-2 text-orange-600" />
            </div>
            <span className="text-gray-600">Preparation Period</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded mr-2"></div>
            <span className="text-gray-600">Unavailable/Blocked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-50 border border-gray-100 rounded mr-2"></div>
            <span className="text-gray-600">Past Dates</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2"></div>
            <span className="text-gray-600">Today (Not Available)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-pink-600 rounded mr-2"></div>
            <span className="text-gray-600">Selected Date</span>
          </div>
        </div>
      </div>

      {/* UPDATED Availability Summary with preparation days info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">
              Package Availability
            </span>
          </div>
          <span className="text-sm text-blue-700">
            Default: {defaultSlots} slot{defaultSlots !== 1 ? "s" : ""} per date
          </span>
        </div>
        <div className="space-y-1 text-xs text-blue-600">
          <p>
            Bookings must be made at least 1 day in advance. Today's date is not available for booking.
          </p>
          {preparationDays > 0 && (
            <p className="font-medium">
              This package requires {preparationDays} preparation day{preparationDays !== 1 ? 's' : ''} after each confirmed booking.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showErrors, setShowErrors] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  // Package store
  const {
    currentPackage,
    loading,
    error: packageError,
    fetchPackageById,
  } = useCurrentPackage();

  // NEW: Add preparation days hook
  const { fetchPreparationDays } = usePackagePreparationDays();

  // State for preparation days info
  const [preparationDaysInfo, setPreparationDaysInfo] = useState<{
    preparationDays: number;
    loading: boolean;
    error: string | null;
  }>({
    preparationDays: 0,
    loading: false,
    error: null,
  });

  // Booking store
  const {
    formData,
    updateFormData,
    error: bookingError,
    setError,
  } = useBookingForm();
  const {
    currentStep,
    setCurrentStep,
    isSubmitting,
    submitBooking,
    resetBooking,
    bookingId,
  } = useBookingFlow();
  const { validateStep } = useBookingValidation();

  // Load package if not in store
  useEffect(() => {
    const packageId = Number(id);
    if (packageId && !isNaN(packageId)) {
      if (!currentPackage || currentPackage.id !== packageId) {
        fetchPackageById(packageId);
      }
    } else {
      navigate("/services");
    }
  }, [id, currentPackage, fetchPackageById, navigate]);

  // NEW: Fetch preparation days when package loads
  useEffect(() => {
    const fetchPackagePreparationDays = async () => {
      if (currentPackage) {
        setPreparationDaysInfo(prev => ({ ...prev, loading: true, error: null }));
        
        try {
          const prepDaysInfo = await fetchPreparationDays(currentPackage.id);
          setPreparationDaysInfo({
            preparationDays: prepDaysInfo.preparationDays,
            loading: false,
            error: null,
          });
          console.log('📅 Fetched preparation days:', prepDaysInfo.preparationDays);
        } catch (error) {
          console.error('Error fetching preparation days:', error);
          setPreparationDaysInfo({
            preparationDays: currentPackage.preparationDays || 0, // Fallback to package data
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch preparation days',
          });
        }
      }
    };

    if (currentPackage) {
      fetchPackagePreparationDays();
    }
  }, [currentPackage, fetchPreparationDays]);

  // Set package price as payment amount when package loads
  useEffect(() => {
    if (currentPackage && formData.paymentAmount === 0) {
      updateFormData({ paymentAmount: currentPackage.numericPrice });
    }
  }, [currentPackage, formData.paymentAmount, updateFormData]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (packageError || !currentPackage) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Package Not Available</div>
          <p className="text-gray-600 mb-4">
            {packageError || "Package not found"}
          </p>
          <button
            onClick={() => navigate("/services")}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const handleNextStep = () => {
    console.log("Current step:", currentStep);
    console.log("Form data:", formData);

    const validation = validateStep(currentStep as "details" | "confirmation");
    console.log("Validation result:", validation);

    setShowErrors(true);

    if (validation.isValid) {
      if (currentStep === "details") {
        // Check authentication before proceeding to payment
        if (!isAuthenticated) {
          console.log("User not authenticated, redirecting to login");

          // Save current booking data to localStorage for persistence
          const bookingData = {
            packageId: currentPackage.id,
            formData: formData,
            timestamp: Date.now(),
          };
          localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

          // Redirect to login with return URL
          navigate("/login", {
            state: {
              from: `/services/${currentPackage.id}/book`,
            },
          });
          return;
        }

        console.log("User authenticated, moving to confirmation step");
        setCurrentStep("confirmation");
      } else if (currentStep === "confirmation") {
        console.log("Submitting booking");
        handleSubmitBooking();
      }
      setShowErrors(false);
    } else {
      console.log("Validation failed:", validation.errors);
      setError(validation.errors[0]);
    }
  };

  // Also update handleSubmitBooking to use the top-level auth state
  const handleSubmitBooking = async () => {
    if (!isAuthenticated || !user) {
      setError("Please log in to complete your booking");

      // Persist data before redirecting
      const bookingData = {
        packageId: currentPackage.id,
        formData: formData,
        timestamp: Date.now(),
      };
      localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

      navigate("/login", {
        state: {
          from: `/services/${currentPackage.id}/book`,
          message: "Please log in to complete your booking",
        },
      });
      return;
    }

    await submitBooking(currentPackage.id);
  };

  const handlePrevStep = () => {
    setShowErrors(false);
    setError(null);
    if (currentStep === "confirmation") {
      setCurrentStep("details");
    }
  };

  const handleDateSelect = (date: string) => {
    updateFormData({ weddingDate: date });
  };

  const handlePaymentMethodSelect = (method: string) => {
    updateFormData({ paymentMethod: method as any });
  };

  const handleReceiptUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateFormData({
        receiptFile: file,
        receiptPreview: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          rating > index ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Success Step
  if (currentStep === "success") {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Booking & Payment Submitted!
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Thank you for choosing {currentPackage.planner.businessName}! Your
              booking request and payment receipt have been sent. You'll receive
              a confirmation email once your payment is verified.
            </p>

            <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-pink-800 mb-2">
                Booking Reference
              </h3>
              <p className="text-pink-700 font-mono text-lg">{bookingId}</p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                {currentPackage.planner.businessName} will verify your payment
                and contact you within 24 hours to confirm your booking and
                discuss the next steps.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    resetBooking();
                    navigate("/services");
                  }}
                  className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Browse More Packages
                </button>

                <button
                  onClick={() => navigate(`/services/${currentPackage.id}`)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Package Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => navigate("/")}
                className="text-sm font-medium text-pink-600 hover:text-pink-500"
              >
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-300">/</span>
                <button
                  onClick={() => navigate("/services")}
                  className="text-sm font-medium text-pink-600 hover:text-pink-500"
                >
                  Packages
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-300">/</span>
                <button
                  onClick={() => navigate(`/services/${currentPackage.id}`)}
                  className="text-sm font-medium text-pink-600 hover:text-pink-500"
                >
                  {currentPackage.title}
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-300">/</span>
                <span className="text-sm font-medium text-gray-500">
                  Book Now
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div
              className={`flex items-center ${
                currentStep === "details" ? "text-pink-600" : "text-gray-400"
              }`}
            >
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                  currentStep === "details"
                    ? "border-pink-600 bg-pink-600 text-white"
                    : "border-gray-300"
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>

            <div
              className={`w-16 h-0.5 ${
                currentStep === "confirmation" ? "bg-pink-600" : "bg-gray-300"
              }`}
            ></div>

            <div
              className={`flex items-center ${
                currentStep === "confirmation"
                  ? "text-pink-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                  currentStep === "confirmation"
                    ? "border-pink-600 bg-pink-600 text-white"
                    : "border-gray-300"
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Payment & Confirmation</span>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {currentStep === "details"
                  ? "Booking Details"
                  : "Payment & Confirmation"}
              </h1>

              {/* Error Display */}
              {bookingError && showErrors && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{bookingError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Details Step */}
              {currentStep === "details" && (
                <div className="space-y-8">
                  {/* Date Selection with Enhanced Calendar - UPDATED with preparation days */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Select Wedding Date
                      </h3>
                      {/* NEW: Show preparation days info */}
                      {preparationDaysInfo.preparationDays > 0 && (
                        <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {preparationDaysInfo.preparationDays} prep day{preparationDaysInfo.preparationDays !== 1 ? 's' : ''} after booking
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <BookingCalendar
                      selectedDate={formData.weddingDate}
                      onDateSelect={handleDateSelect}
                      packageId={currentPackage.id}
                      defaultSlots={currentPackage.defaultSlots}
                      preparationDays={preparationDaysInfo.preparationDays} // NEW: Pass preparation days
                    />
                  </div>

                  {/* Additional Details */}
                  {formData.weddingDate && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Time
                        </label>
                        <input
                          type="time"
                          value={formData.weddingTime}
                          onChange={(e) =>
                            updateFormData({ weddingTime: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Venue/Location *
                        </label>
                        <textarea
                          value={formData.venue}
                          onChange={(e) =>
                            updateFormData({ venue: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Wedding venue or location"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Requests or Notes
                        </label>
                        <textarea
                          value={formData.specialRequests}
                          onChange={(e) =>
                            updateFormData({
                              specialRequests: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Any special requests, dietary restrictions, or other details you'd like to share..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmation Step */}
              {currentStep === "confirmation" && (
                <div className="space-y-8">
                  {/* Booking Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Booking Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wedding Date:</span>
                        <span className="font-medium">
                          {formatDate(formData.weddingDate)}
                        </span>
                      </div>
                      {formData.weddingTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">
                            {formData.weddingTime}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Venue:</span>
                        <span className="font-medium">{formData.venue}</span>
                      </div>
                      {formData.specialRequests && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Special Requests:
                          </span>
                          <span className="font-medium text-right max-w-xs">
                            {formData.specialRequests}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-3 mt-4">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">
                            Total Amount:
                          </span>
                          <span className="text-2xl font-bold text-pink-600">
                            ₱{formData.paymentAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <PaymentMethodSelector
                    selectedMethod={formData.paymentMethod}
                    onMethodSelect={handlePaymentMethodSelect}
                    paymentAmount={formData.paymentAmount}
                    onReceiptUpload={handleReceiptUpload}
                    receiptPreview={formData.receiptPreview}
                    paymentInfo={mockPaymentInfo}
                  />

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.agreedToTerms}
                        onChange={(e) =>
                          updateFormData({ agreedToTerms: e.target.checked })
                        }
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 mt-1"
                      />
                      <label
                        htmlFor="terms"
                        className="ml-3 text-sm text-gray-700"
                      >
                        I agree to the{" "}
                        <button className="text-pink-600 hover:text-pink-500">
                          Terms and Conditions
                        </button>{" "}
                        *
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={formData.agreedToPrivacy}
                        onChange={(e) =>
                          updateFormData({ agreedToPrivacy: e.target.checked })
                        }
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 mt-1"
                      />
                      <label
                        htmlFor="privacy"
                        className="ml-3 text-sm text-gray-700"
                      >
                        I agree to the{" "}
                        <button className="text-pink-600 hover:text-pink-500">
                          Privacy Policy
                        </button>{" "}
                        *
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={formData.allowMarketing}
                        onChange={(e) =>
                          updateFormData({ allowMarketing: e.target.checked })
                        }
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 mt-1"
                      />
                      <label
                        htmlFor="marketing"
                        className="ml-3 text-sm text-gray-700"
                      >
                        I'd like to receive updates about special offers and
                        wedding tips
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  onClick={
                    currentStep === "details"
                      ? () => navigate(`/services/${currentPackage.id}`)
                      : handlePrevStep
                  }
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  {currentStep === "details" ? "Back to Package" : "Previous"}
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={isSubmitting || !formData.weddingDate}
                  className="flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      {currentStep === "details"
                        ? "Continue to Payment"
                        : "Submit Booking & Payment"}
                      {currentStep === "details" && (
                        <ChevronRight className="h-5 w-5 ml-1" />
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Package Summary Sidebar - UPDATED with preparation days info */}
          <div className="mt-8 lg:mt-0">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Package Details
                </h3>

                <div className="space-y-4">
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <img
                      src={
                        currentPackage.thumbnail ||
                        currentPackage.images[0] ||
                        "/placeholder-image.jpg"
                      }
                      alt={currentPackage.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {currentPackage.title}
                    </h4>
                    <p className="text-2xl font-bold text-pink-600 mt-1">
                      {currentPackage.price}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex">
                      {renderStars(currentPackage.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {currentPackage.rating} ({currentPackage.reviewCount}{" "}
                      reviews)
                    </span>
                  </div>

                  {/* Default Slots Information - UPDATED with preparation days */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">
                          Availability Info
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-800">
                        {currentPackage.defaultSlots} slot
                        {currentPackage.defaultSlots !== 1 ? "s" : ""}/date
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <p>
                        Each date has {currentPackage.defaultSlots} slot
                        {currentPackage.defaultSlots !== 1 ? "s" : ""} by default.
                        Some dates may have custom allocations.
                      </p>
                      {/* NEW: Show preparation days info */}
                      {preparationDaysInfo.preparationDays > 0 && (
                        <p className="font-medium text-orange-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {preparationDaysInfo.preparationDays} preparation day
                          {preparationDaysInfo.preparationDays !== 1 ? "s" : ""} 
                          required after each confirmed booking.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={
                          currentPackage.planner.profilePicture ||
                          "/placeholder-avatar.jpg"
                        }
                        alt={currentPackage.planner.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {currentPackage.planner.name}
                        </p>
                        <p className="text-sm text-pink-600">
                          {currentPackage.planner.businessName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        {currentPackage.planner.location}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        {currentPackage.planner.business_phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        {currentPackage.planner.business_email}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      What's Included:
                    </h5>
                    <ul className="space-y-1">
                      {currentPackage.inclusions
                        .slice(0, 4)
                        .map((inclusion, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-center"
                          >
                            <Heart className="h-3 w-3 text-pink-500 mr-2 flex-shrink-0" />
                            {inclusion}
                          </li>
                        ))}
                      {currentPackage.inclusions.length > 4 && (
                        <li className="text-sm text-gray-500 italic">
                          +{currentPackage.inclusions.length - 4} more items
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;