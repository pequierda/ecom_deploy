// App.tsx - Updated routes with planner approval requirements
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ServiceDetailsPage from "./pages/ServiceDetailPage";
import BookingPage from "./pages/BookingPage";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { useAuthStore } from "./stores/authStore.ts";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

// Client Components
import ClientDashboard from "./pages/ClientDashboard";
import ClientMyBookings from "./pages/client/MyBookings";
import ClientProfile from "./pages/client/Profile";
import ClientPayments from "./pages/client/Payments";
import ClientMessages from "./pages/client/Messages";

// Planner Components
import PlannerDashboard from "./pages/PlannerDashboard";
import PlannerClients from "./pages/planner/Clients";
import PlannerServices from "./pages/planner/Services";
import PlannerBookings from "./pages/planner/Bookings";
import PlannerCalendar from "./pages/planner/Calendar";
import PlannerReports from "./pages/planner/Reports";
import PlannerProfile from "./pages/planner/Profile";

// Admin Components
import BPLOAdminDashboard from "./pages/BploPage";
import AdminUsers from "./pages/admin/Users";
import AdminPlanners from "./pages/admin/Planners";
import AdminServices from "./pages/admin/Services";
import AdminBookings from "./pages/admin/Bookings";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminAnalytics from "./pages/admin/Analytics";
import ReviewPage from "./pages/ReviewPage.tsx";
import ClientServiceDetailsPage from "./pages/client/ClientServiceDetailsPage.tsx";

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar: boolean;
  showFooter: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  role?: "admin" | "planner" | "client";
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showNavbar,
  showFooter,
  isLoggedIn,
  role,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar isLoggedIn={isLoggedIn} role={role} />}
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

// 404 Not Found component
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
      <a
        href="/"
        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Go Back Home
      </a>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { checkAuth, user, isAuthenticated, isLoading } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync local state with Zustand store
  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Router>
      <ErrorBoundary>
        <ScrollToTop />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route
            path="/"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <HomePage />
              </PageLayout>
            }
          />

          <Route
            path="/services"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <ServicesPage />
              </PageLayout>
            }
          />

          <Route
            path="/about"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <AboutPage />
              </PageLayout>
            }
          />

          <Route
            path="/contact"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <ContactPage />
              </PageLayout>
            }
          />

          {/* PACKAGE ROUTES */}
          <Route
            path="/services/:id"
            element={
              <ErrorBoundary>
                <PageLayout
                  showNavbar={true}
                  showFooter={true}
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  role={user?.role}
                >
                  <ServiceDetailsPage />
                </PageLayout>
              </ErrorBoundary>
            }
          />

          <Route
            path="/packages/:id"
            element={
              <ErrorBoundary>
                <PageLayout
                  showNavbar={true}
                  showFooter={true}
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  role={user?.role}
                >
                  <ServiceDetailsPage />
                </PageLayout>
              </ErrorBoundary>
            }
          />

          <Route
            path="/planner/:id/reviews"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <ReviewPage />
              </PageLayout>
            }
          />

          {/* BOOKING ROUTES */}
          <Route
            path="/booking"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <BookingPage />
              </PageLayout>
            }
          />

          <Route
            path="/services/:id/book"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <BookingPage />
              </PageLayout>
            }
          />

          <Route
            path="/booking/:packageId"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <BookingPage />
              </PageLayout>
            }
          />

          {/* AUTH ROUTES */}
          <Route
            path="/login"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <LoginPage setIsLoggedIn={setIsLoggedIn} />
              </PageLayout>
            }
          />

          <Route
            path="/register"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                role={user?.role}
              >
                <RegisterPage />
              </PageLayout>
            }
          />

          {/* NOT FOUND ROUTE */}
          <Route
            path="/not-found"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              >
                <NotFoundPage />
              </PageLayout>
            }
          />

          {/* CLIENT PROTECTED ROUTES */}
          <Route
            path="/client/dashboard"
            element={
              <RoleProtectedRoute requiredRoles={["client"]}>
                <ClientDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/client/bookings"
            element={
              <RoleProtectedRoute requiredRoles={["client"]}>
                <ClientMyBookings />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/client/service/:id"
            element={
              <RoleProtectedRoute requiredRoles={["client"]}>
                <ClientServiceDetailsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/client/profile"
            element={
              <RoleProtectedRoute requiredRoles={["client"]}>
                <ClientProfile />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/client/payments"
            element={
              <RoleProtectedRoute requiredRoles={["client"]}>
                <ClientPayments />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/client/messages"
            element={
              <RoleProtectedRoute requiredRoles={["client"]}>
                <ClientMessages />
              </RoleProtectedRoute>
            }
          />

          {/* PLANNER PROTECTED ROUTES - Profile and status pages allow pending */}
          <Route
            path="/planner/profile"
            element={
              <RoleProtectedRoute
                requiredRoles={["planner"]}
                allowPending={true}
              >
                <PlannerProfile />
              </RoleProtectedRoute>
            }
          />

          {/* PLANNER ROUTES REQUIRING APPROVAL */}
          <Route
            path="/planner/dashboard"
            element={
              <RoleProtectedRoute
                requiredRoles={["planner"]}
                requireApproved={true}
              >
                <PlannerDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/planner/clients"
            element={
              <RoleProtectedRoute
                requiredRoles={["planner"]}
                requireApproved={true}
              >
                <PlannerClients />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/planner/services"
            element={
              <RoleProtectedRoute
                requiredRoles={["planner"]}
                requireApproved={true}
              >
                <PlannerServices />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/planner/bookings"
            element={
              <RoleProtectedRoute
                requiredRoles={["planner"]}
                requireApproved={true}
              >
                <PlannerBookings />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/planner/calendar"
            element={
              <RoleProtectedRoute
                requiredRoles={["planner"]}
                requireApproved={true}
              >
                <PlannerCalendar />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/planner/reports"
            element={
              <RoleProtectedRoute
                requiredRoles={["planner"]}
                requireApproved={true}
              >
                <PlannerReports />
              </RoleProtectedRoute>
            }
          />

          {/* ADMIN PROTECTED ROUTES */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <BPLOAdminDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/bplo/dashboard"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <BPLOAdminDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <AdminUsers />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/planners"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <AdminPlanners />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/services"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <AdminServices />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <AdminBookings />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <AdminReports />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <AdminSettings />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <RoleProtectedRoute requiredRoles={["admin"]}>
                <AdminAnalytics />
              </RoleProtectedRoute>
            }
          />

          {/* 404 CATCH-ALL ROUTE */}
          <Route
            path="*"
            element={
              <PageLayout
                showNavbar={true}
                showFooter={true}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              >
                <NotFoundPage />
              </PageLayout>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
