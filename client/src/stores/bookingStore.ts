// stores/bookingStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  BookingFormData,
  BookingStore,
  CreateBookingRequest,
  CreateBookingResponse,
} from "../types/booking";

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Initial form data - updated to include payment fields
const initialFormData: BookingFormData = {
  // Essential booking data
  weddingDate: "",
  weddingTime: "",
  venue: "",
  specialRequests: "",

  // Payment data
  paymentMethod: "",
  paymentAmount: 0,
  receiptFile: null,
  receiptPreview: "",

  // Agreements
  agreedToTerms: false,
  agreedToPrivacy: false,
  allowMarketing: false,
};

export const useBookingStore = create<BookingStore>()(
  devtools(
    (set, get) => ({
      // State
      formData: initialFormData,
      currentStep: "details",
      isSubmitting: false,
      error: null,
      bookingId: null,

      // Actions
      updateFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setError: (error) => {
        set({ error });
      },

      validateStep: (step) => {
        const { formData } = get();
        const errors: string[] = [];

        if (step === "details") {
          // Only validate essential booking fields
          if (!formData.weddingDate) {
            errors.push("Wedding date is required");
          }
          if (!formData.venue.trim()) {
            errors.push("Venue is required");
          }

          // Validate wedding date is in the future
          if (formData.weddingDate) {
            const selectedDate = new Date(formData.weddingDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
              errors.push("Wedding date must be in the future");
            }
          }
        }

        if (step === "confirmation") {
          // Validation for confirmation step
          if (!formData.paymentMethod) {
            errors.push("Please select a payment method");
          }
          if (formData.paymentAmount <= 0) {
            errors.push("Payment amount is required");
          }
          if (!formData.receiptFile && !formData.receiptPreview) {
            errors.push("Please upload your payment receipt");
          }
          if (!formData.agreedToTerms) {
            errors.push("You must agree to the Terms and Conditions");
          }
          if (!formData.agreedToPrivacy) {
            errors.push("You must agree to the Privacy Policy");
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },

      submitBooking: async (packageId) => {
        set({ isSubmitting: true, error: null });

        try {
          const { formData } = get();

          // Check authentication first
          const authStore = (await import("../stores/authStore")).useAuthStore;
          const { isAuthenticated, user } = authStore.getState();

          console.log("🔍 SUBMIT BOOKING DEBUG");
          console.log("User from auth store:", user);
          console.log("User ID type:", typeof user?.user_id);
          console.log("User ID value:", user?.user_id);
          console.log("Is authenticated:", isAuthenticated);

          if (!isAuthenticated || !user) {
            throw new Error(
              "Authentication required. Please log in to complete your booking."
            );
          }

          // Test the actual API call to see what token contains
          try {
            const testResponse = await fetch(`${API_BASE_URL}/auth/me`, {
              method: "GET",
              credentials: "include",
            });
            const tokenData = await testResponse.json();
            console.log("🔍 TOKEN DATA:", tokenData);
          } catch (e) {
            console.log("❌ Token test failed:", e);
          }

          // Final validation
          const detailsValidation = get().validateStep("details");
          const confirmationValidation = get().validateStep("confirmation");

          if (!detailsValidation.isValid || !confirmationValidation.isValid) {
            const allErrors = [
              ...detailsValidation.errors,
              ...confirmationValidation.errors,
            ];
            throw new Error(allErrors.join(", "));
          }

          // Prepare request data
          const requestData: CreateBookingRequest = {
            packageId,
            weddingDate: formData.weddingDate,
            weddingTime: formData.weddingTime || undefined,
            venue: formData.venue,
            specialRequests: formData.specialRequests || undefined,
            paymentMethod: formData.paymentMethod as any,
            paymentAmount: formData.paymentAmount,
            receiptFile: formData.receiptFile || undefined,
            allowMarketing: formData.allowMarketing,
          };

          console.log("🔍 BEFORE FORMDATA CREATION");
          console.log("formData.receiptFile:", formData.receiptFile);
          console.log(
            "formData.receiptPreview length:",
            formData.receiptPreview?.length
          );
          console.log("Submitting booking with data:", requestData);

          // Create FormData for file upload
          const formDataToSend = new FormData();

          // Debug each field addition
          Object.entries(requestData).forEach(([key, value]) => {
            if (key !== "receiptFile" && value !== undefined) {
              console.log(
                `Adding to FormData: ${key} = ${value} (type: ${typeof value})`
              );
              formDataToSend.append(key, value.toString());
            }
          });

          // Debug file addition
          if (formData.receiptFile) {
            console.log("✅ Adding receiptFile to FormData:", {
              name: formData.receiptFile.name,
              size: formData.receiptFile.size,
              type: formData.receiptFile.type,
            });
            formDataToSend.append("receiptFile", formData.receiptFile);
          } else {
            console.log("❌ No receiptFile found in formData");
          }

          // Debug final FormData contents
          console.log("🔍 FINAL FORMDATA CONTENTS:");
          for (let [key, value] of formDataToSend.entries()) {
            if (value instanceof File) {
              console.log(
                `${key}: FILE - ${value.name} (${value.size} bytes, ${value.type})`
              );
            } else {
              console.log(`${key}: ${value}`);
            }
          }

          // Submit booking with authentication
          const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: "POST",
            credentials: "include", // Include cookies for authentication
            body: formDataToSend, // Using FormData instead of JSON for file upload
          });

          if (!response.ok) {
            const errorData = await response.json();

            // Handle authentication errors
            if (response.status === 401) {
              throw new Error("Session expired. Please log in again.");
            }

            throw new Error(errorData.message || "Failed to submit booking");
          }

          const data: CreateBookingResponse = await response.json();

          // Clear any stored pending booking data
          localStorage.removeItem("pendingBooking");

          // Update state with success
          set({
            bookingId: data.bookingId,
            currentStep: "success",
            isSubmitting: false,
            error: null,
          });
        } catch (error) {
          console.error("Error submitting booking:", error);
          set({
            isSubmitting: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to submit booking",
          });
        }
      },

      // Add method to persist booking data
      persistBookingData: (packageId: number) => {
        const { formData } = get();
        const bookingData = {
          packageId,
          formData,
          timestamp: Date.now(),
        };
        localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
      },

      // Add method to restore booking data - IMPROVED VERSION
      restoreBookingData: (packageId: number) => {
        try {
          const pendingBooking = localStorage.getItem("pendingBooking");
          if (pendingBooking) {
            const bookingData = JSON.parse(pendingBooking);

            // CHANGED: Use 5 minutes instead of 1 hour
            const isRecent = Date.now() - bookingData.timestamp < 300000; // 5 minutes
            const isCorrectPackage = bookingData.packageId === packageId;

            if (isRecent && isCorrectPackage) {
              const { updateFormData, setCurrentStep } = get();

              // Type-safe restoration of form data
              const restoredData: Partial<BookingFormData> = {};

              // Define which keys can be restored (exclude receiptFile as it can't be serialized)
              const restorableKeys: (keyof BookingFormData)[] = [
                "weddingDate",
                "weddingTime",
                "venue",
                "specialRequests",
                "paymentMethod",
                "paymentAmount",
                "receiptPreview", // Keep preview but not file
                "agreedToTerms",
                "agreedToPrivacy",
                "allowMarketing",
              ];

              // Only restore valid, changed values
              restorableKeys.forEach((key) => {
                if (bookingData.formData[key] !== undefined) {
                  restoredData[key] = bookingData.formData[key];
                }
              });

              // Update form data
              updateFormData(restoredData);

              // Move to confirmation step if user was trying to proceed to payment
              if (bookingData.formData.weddingDate) {
                setCurrentStep("confirmation");
              }

              // Clear the stored data
              localStorage.removeItem("pendingBooking");

              return true;
            }
          }
          return false;
        } catch (error) {
          console.error("Error restoring booking data:", error);
          localStorage.removeItem("pendingBooking");
          return false;
        }
      },
      resetBooking: () => {
        set({
          formData: initialFormData,
          currentStep: "details",
          isSubmitting: false,
          error: null,
          bookingId: null,
        });
      },
    }),
    {
      name: "booking-store",
    }
  )
);

// Utility hooks for different parts of the booking process
export const useBookingForm = () => {
  const formData = useBookingStore((state) => state.formData);
  const updateFormData = useBookingStore((state) => state.updateFormData);
  const error = useBookingStore((state) => state.error);
  const setError = useBookingStore((state) => state.setError);

  return { formData, updateFormData, error, setError };
};

export const useBookingFlow = () => {
  const currentStep = useBookingStore((state) => state.currentStep);
  const setCurrentStep = useBookingStore((state) => state.setCurrentStep);
  const isSubmitting = useBookingStore((state) => state.isSubmitting);
  const submitBooking = useBookingStore((state) => state.submitBooking);
  const resetBooking = useBookingStore((state) => state.resetBooking);
  const bookingId = useBookingStore((state) => state.bookingId);

  return {
    currentStep,
    setCurrentStep,
    isSubmitting,
    submitBooking,
    resetBooking,
    bookingId,
  };
};

export const useBookingValidation = () => {
  const validateStep = useBookingStore((state) => state.validateStep);

  return { validateStep };
};
