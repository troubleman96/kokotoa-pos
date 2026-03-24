import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useSubscriptionStatus } from "@/hooks/use-subscriptions";
import Landing from "./pages/Landing";
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Reports from "./pages/reports";
import Settings from "./pages/Settings";
import StockHistory from "./pages/StockHistory";
import SalesHistory from "./pages/SalesHistory";
import CreditDebts from "./pages/CreditDebts";
import Notebook from "./pages/Notebook";
import Users from "./pages/management/Users";
import CreateStore from "./pages/management/CreateStore";
import Subscription from "./pages/Subscription";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import PhoneVerification from "./pages/auth/PhoneVerification";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";
import MathLoader from "@/components/ui/MathLoader";

const queryClient = new QueryClient();

import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        <MathLoader size="xl" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const SubscriptionProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const {
    data: subscriptionStatus,
    isLoading,
    isError,
  } = useSubscriptionStatus(user?.role === 'OWNER');

  if (user?.role !== 'OWNER') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        <MathLoader size="xl" />
      </div>
    );
  }

  if (!isError && subscriptionStatus && !subscriptionStatus.has_access) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

import { SettingsProvider } from "@/contexts/SettingsContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import ScrollToHashElement from "@/components/ScrollToHashElement";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ScrollToHashElement />
      <LanguageProvider>
        <AuthProvider>
          <SettingsProvider>
            <OnboardingProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/verify-phone" element={<PhoneVerification />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/dashboard" element={<ProtectedRoute><SubscriptionProtectedRoute><Dashboard /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/pos" element={<ProtectedRoute><SubscriptionProtectedRoute><POS /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><SubscriptionProtectedRoute><Inventory /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/inventory/add" element={<ProtectedRoute><SubscriptionProtectedRoute><Inventory /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/stock-history" element={<ProtectedRoute><SubscriptionProtectedRoute><StockHistory /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/sales-history" element={<ProtectedRoute><SubscriptionProtectedRoute><SalesHistory /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/credit-debts" element={<ProtectedRoute><SubscriptionProtectedRoute><CreditDebts /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/notebook" element={<ProtectedRoute><SubscriptionProtectedRoute><Notebook /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><SubscriptionProtectedRoute><Reports /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><SubscriptionProtectedRoute><Users /></SubscriptionProtectedRoute></ProtectedRoute>} />
                    <Route path="/create-store" element={<ProtectedRoute><CreateStore /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </NotificationProvider>
            </OnboardingProvider>
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
