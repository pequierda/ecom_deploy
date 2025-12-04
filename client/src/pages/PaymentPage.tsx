import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Lock,
  Shield,
  Smartphone,
} from "lucide-react";
import InputGroup from "./components/ui/InputGroup";

const PaymentPage = ({
  packageData,
  bookingData,
  paymentData,
  setPaymentData,
  currentStep,
  setCurrentStep,
  handlePaymentSubmit: handlePaymentSubmit,
}: any) => {
  if (currentStep !== "payment") return null;

  const serviceFee = Math.round(packageData.numericPrice * 0.03);
  const total = packageData.numericPrice + serviceFee;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => setCurrentStep("booking")}
            className="flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking Details
          </button>
          <div className="flex items-start space-x-4">
            <img
              src={packageData.images[0]}
              alt={packageData.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {packageData.name}
              </h1>
              <p className="text-lg font-semibold text-pink-600">
                {packageData.price}
              </p>
              <p className="text-sm text-gray-600">
                {packageData.planner.businessName}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center text-green-600">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium">Booking Details</span>
            </div>
            <div className="flex-1 h-px bg-green-300 mx-4"></div>
            <div className="flex items-center text-pink-600">
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">3</span>
              </div>
              <span className="ml-2 text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Information
              </h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Credit Card */}
                  <button
                    onClick={() =>
                      setPaymentData({
                        ...paymentData,
                        paymentMethod: "credit",
                      })
                    }
                    className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      paymentData.paymentMethod === "credit"
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Credit/Debit Card
                      </p>
                      <p className="text-sm text-gray-500">
                        Visa, Mastercard, JCB
                      </p>
                    </div>
                  </button>

                  {/* E-Wallet */}
                  <button
                    onClick={() =>
                      setPaymentData({
                        ...paymentData,
                        paymentMethod: "ewallet",
                      })
                    }
                    className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      paymentData.paymentMethod === "ewallet"
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Smartphone className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">E-Wallet</p>
                      <p className="text-sm text-gray-500">
                        GCash, PayMaya, GrabPay
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Credit Card Form */}
              {paymentData.paymentMethod === "credit" && (
                <div className="space-y-4">
                  <InputGroup
                    label="Card Number *"
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cardNumber: e.target.value,
                      })
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    type="text"
                  />

                  <InputGroup
                    label="Cardholder Name *"
                    value={paymentData.cardName}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cardName: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                    type="text"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup
                      label="Expiry Date *"
                      value={paymentData.expiryDate}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          expiryDate: e.target.value,
                        })
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      type="text"
                    />
                    <InputGroup
                      label="CVV *"
                      value={paymentData.cvv}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cvv: e.target.value })
                      }
                      placeholder="123"
                      maxLength={3}
                      type="text"
                    />
                  </div>
                </div>
              )}

              {/* E-Wallet Form */}
              {paymentData.paymentMethod === "ewallet" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Wallet Provider *
                  </label>
                  <select
                    value={paymentData.ewalletProvider}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        ewalletProvider: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="gcash">GCash</option>
                    <option value="paymaya">PayMaya</option>
                    <option value="grabpay">GrabPay</option>
                  </select>

                  <InputGroup
                    label="Mobile Number *"
                    value={paymentData.ewalletNumber}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        ewalletNumber: e.target.value,
                      })
                    }
                    placeholder="+63 912 345 6789"
                    type="tel"
                  />
                </div>
              )}

              {/* Security Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Secure Payment
                  </p>
                  <p className="text-sm text-blue-600">
                    Your payment information is encrypted and secure using
                    industry-standard SSL encryption.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep("booking")}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="px-8 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Complete Payment
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Package</span>
                  <span className="font-medium">{packageData.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">
                    ₱{serviceFee.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-pink-600">
                      ₱{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg
                    className="h-5 w-5 text-yellow-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Payment Terms
                    </p>
                    <p className="text-sm text-yellow-700">
                      This is a booking deposit. Final payment will be arranged
                      with your planner.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Wedding Date:</strong> {bookingData.weddingDate}
                </p>
                <p>
                  <strong>Guest Count:</strong>{" "}
                  {bookingData.guestCount || "To be confirmed"}
                </p>
                <p>
                  <strong>Planner:</strong> {packageData.planner.businessName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
