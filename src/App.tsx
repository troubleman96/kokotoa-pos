import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useSubscriptionStatus } from "@/hooks/use-subscriptions";
import { useAuth } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";
import MathLoader from "@/components/ui/MathLoader";

const queryClient = new QueryClient();

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
import AppErrorBoundary from "@/components/AppErrorBoundary";

const App = () => (
  <AppErrorBoundary>
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
                    <Route path="/dashboard" element={<SubscriptionProtectedRoute><Dashboard /></SubscriptionProtectedRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/pos" element={<SubscriptionProtectedRoute><POS /></SubscriptionProtectedRoute>} />
                    <Route path="/inventory" element={<SubscriptionProtectedRoute><Inventory /></SubscriptionProtectedRoute>} />
                    <Route path="/inventory/add" element={<SubscriptionProtectedRoute><Inventory /></SubscriptionProtectedRoute>} />
                    <Route path="/stock-history" element={<SubscriptionProtectedRoute><StockHistory /></SubscriptionProtectedRoute>} />
                    <Route path="/sales-history" element={<SubscriptionProtectedRoute><SalesHistory /></SubscriptionProtectedRoute>} />
                    <Route path="/credit-debts" element={<SubscriptionProtectedRoute><CreditDebts /></SubscriptionProtectedRoute>} />
                    <Route path="/notebook" element={<SubscriptionProtectedRoute><Notebook /></SubscriptionProtectedRoute>} />
                    <Route path="/reports" element={<SubscriptionProtectedRoute><Reports /></SubscriptionProtectedRoute>} />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/users" element={<SubscriptionProtectedRoute><Users /></SubscriptionProtectedRoute>} />
                    <Route path="/create-store" element={<CreateStore />} />
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
  </AppErrorBoundary>
);

export default App;
