import { CheckCircle, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";
import type { WeddingPackage } from "../types/WeddingPackage";

interface ConfirmationPageProps {
  packageData: WeddingPackage;
  bookingData: any;
  currentStep: string;
renderStars: (rating: number) => JSX.Element | JSX.Element[];
}

const ConfirmationPage = ({
  packageData,
  bookingData,
  currentStep,
  renderStars,
}: ConfirmationPageProps) => {
  if (currentStep !== "confirmation") return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your wedding planning journey with{" "}
            {packageData.planner.businessName} has begun!
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-4 mb-6">
            <img
              src={packageData.images[0]}
              alt={packageData.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {packageData.name}
              </h2>
              <p className="text-lg font-semibold text-pink-600">
                {packageData.price}
              </p>
              <p className="text-gray-600">
                {packageData.planner.businessName}
              </p>
              <div className="flex items-center mt-2">
                {renderStars(packageData.planner.rating)}
                <span className="ml-2 text-sm text-gray-500">
                  {packageData.planner.rating}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wedding Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Wedding Details
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Date:</strong> {bookingData.weddingDate}
                </p>
                <p>
                  <strong>Guest Count:</strong>{" "}
                  {bookingData.guestCount || "To be confirmed"}
                </p>
                <p>
                  <strong>Venue:</strong>{" "}
                  {bookingData.venue || "To be discussed"}
                </p>
                <p>
                  <strong>Budget:</strong>{" "}
                  {bookingData.budget || "To be discussed"}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Contact Information
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Name:</strong> {bookingData.contactName}
                </p>
                <p>
                  <strong>Email:</strong> {bookingData.contactEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {bookingData.contactPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {bookingData.specialRequests && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Special Requests
              </h3>
              <p className="text-sm text-gray-600">
                {bookingData.specialRequests}
              </p>
            </div>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            What Happens Next?
          </h2>
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "Confirmation Call",
                desc: `${packageData.planner.name} will call you within 24 hours to confirm your booking and discuss initial details.`,
              },
              {
                step: 2,
                title: "Initial Consultation",
                desc: "Schedule your first meeting to discuss your vision, preferences, and detailed planning timeline.",
              },
              {
                step: 3,
                title: "Planning Begins",
                desc: "Start the exciting journey of planning your perfect wedding day with expert guidance.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-pink-600 text-sm font-semibold">
                    {step}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planner Contact Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Wedding Planner
          </h2>
          <div className="flex items-start space-x-4">
            <img
              src={packageData.planner.image}
              alt={packageData.planner.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">
                {packageData.planner.name}
              </h3>
              <p className="text-pink-600 font-medium">
                {packageData.planner.businessName}
              </p>
              <div className="flex items-center mt-1 space-x-4">
                <div className="flex items-center">
                  {renderStars(packageData.planner.rating)}
                  <span className="ml-2 text-sm text-gray-500">
                    {packageData.planner.rating}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {packageData.planner.location}
                </div>
              </div>

              <div className="mt-3 flex space-x-3">
                <Link
                  to={`/planner/${packageData.planner.id}`}
                  className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700 transition-colors"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  View {packageData.planner.name}
                </Link>
                <button
                  onClick={() =>
                    alert(
                      `Opening chat with ${packageData.planner.businessName}`
                    )
                  }
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
