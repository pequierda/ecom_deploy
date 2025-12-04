import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Heart,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";

const LoginPage = ({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (value: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Zustand store
  const {
    login,
    isLoading,
    error,
    clearError,
    user,
    isAuthenticated,
    getPlannerStatus,
  } = useAuthStore();

  // Get redirect info from navigation state - ensure it's always a string
  const from = String(location.state?.from || "/");
  const loginMessage = location.state?.message;

  // Clear error when component mounts or when user starts typing
  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    console.log("🔍 Auth state changed:", { isAuthenticated, user });

    if (isAuthenticated && user) {
      console.log("✅ User authenticated:", user);
      setIsLoggedIn(true);

      // Check if redirecting back to booking - ADD TIME CHECK HERE
      if (from.includes("/book")) {
        // Check if booking is still recent (5 minutes)
        const pendingBooking = localStorage.getItem("pendingBooking");
        let shouldRedirectToBooking = false;

        if (pendingBooking) {
          try {
            const bookingData = JSON.parse(pendingBooking);
            const isRecent = Date.now() - bookingData.timestamp < 300000; // 5 minutes
            shouldRedirectToBooking = isRecent;
          } catch (e) {
            localStorage.removeItem("pendingBooking");
          }
        }

        if (shouldRedirectToBooking) {
          console.log(`🚀 Redirecting back to booking: ${from}`);
          navigate(from, { replace: true });
          return;
        } else {
          console.log(`⏰ Booking expired, not redirecting to: ${from}`);
          // Clear expired booking data
          localStorage.removeItem("pendingBooking");
        }
      }

      // Default role-based redirect (rest of your existing code)
      let redirectPath = "/";
      if (user.role === "client") {
        redirectPath = "/";
      } else if (user.role === "planner") {
        redirectPath = "/planner/dashboard";
      } else if (user.role === "admin") {
        redirectPath = "/admin/dashboard";
      }

      console.log(`🚀 Navigating to: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, setIsLoggedIn, getPlannerStatus, from]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    console.log("🚀 Starting login process...");
    const success = await login(email, password);

    if (success) {
      console.log("✅ Login successful!");
      console.log("📊 Current auth state:", { isAuthenticated, user });
    } else {
      console.log("❌ Login failed");
    }
  };

  const handleInputChange = () => {
    if (error) {
      clearError();
    }
  };

  // Determine error type and styling
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes("pending approval")) {
      return "warning";
    }
    if (errorMessage.includes("rejected")) {
      return "error";
    }
    return "error";
  };

  const renderErrorIcon = (errorType: string) => {
    switch (errorType) {
      case "warning":
        return (
          <Clock className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
        );
      case "success":
        return (
          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
        );
      default:
        return (
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
        );
    }
  };

  const getErrorStyling = (errorType: string) => {
    switch (errorType) {
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-red-50 border-red-200";
    }
  };

  const getErrorTextColor = (errorType: string) => {
    switch (errorType) {
      case "warning":
        return "text-orange-700";
      case "success":
        return "text-green-700";
      default:
        return "text-red-700";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/80 to-purple-600/80 z-10"></div>
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Wedding celebration background"
        />
        <div className="relative z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md text-center">
            <Heart className="w-16 h-16 mx-auto mb-6 text-pink-200" />
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-xl text-pink-100 leading-relaxed">
              Continue planning your perfect wedding with WeddingMart
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full z-20"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full z-20"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Sign in to your account
            </h2>

            {/* Show booking-specific message if redirected from booking */}
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-pink-600 hover:text-pink-700 transition-colors">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-3xl border border-white/20">
            {/* Enhanced Error Display */}
            {error && (
              <div
                className={`mb-6 border rounded-2xl p-4 ${getErrorStyling(
                  getErrorType(error)
                )}`}
              >
                <div className="flex items-start">
                  {renderErrorIcon(getErrorType(error))}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${getErrorTextColor(
                        getErrorType(error)
                      )}`}
                    >
                      {error}
                    </p>
                    {error.includes("pending approval") && (
                      <p className="text-xs text-orange-600 mt-1">
                        You'll receive an email notification once your account
                        is reviewed.
                      </p>
                    )}
                    {error.includes("rejected") && (
                      <p className="text-xs text-red-600 mt-1">
                        Please contact support at support@weddingmart.com for
                        assistance.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Show pending booking info if available */}
            {(() => {
              const pendingBooking = localStorage.getItem("pendingBooking");
              if (pendingBooking) {
                try {
                  const bookingData = JSON.parse(pendingBooking);
                  const isRecent = Date.now() - bookingData.timestamp < 300000; // 5 minutes
                  if (isRecent) {
                    return (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Complete Your Booking
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Your booking details have been saved. Sign in to
                              continue.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                } catch (e) {
                  // Invalid data, remove it
                  localStorage.removeItem("pendingBooking");
                }
              }
              return null;
            })()}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      handleInputChange();
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/50"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      handleInputChange();
                    }}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/50"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded transition-colors"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 font-medium"
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="/forgot-password"
                    className="font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transform hover:-translate-y-0.5 transition-all duration-200 ${
                    isLoading || !email || !password
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
