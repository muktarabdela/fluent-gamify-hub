import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";
import Onboarding from "@/pages/Onboarding";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

const queryClient = new QueryClient();

// Protected Route component to handle redirects based on onboarding status
const ProtectedRoute = ({ children }) => {
  const userPreferences = localStorage.getItem("userPreferences");
  
  // If trying to access onboarding page but already completed
  if (window.location.pathname === "/" && userPreferences) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If trying to access any other page but haven't completed onboarding
  if (window.location.pathname !== "/" && !userPreferences) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppLayout = ({ children }) => {
  // Don't show header/nav on onboarding page
  const isOnboarding = window.location.pathname === "/";
  
  return (
    <>
      {!isOnboarding && <Header />}
      {children}
      {!isOnboarding && <Navigation />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Onboarding route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          
          {/* Other routes */}
          {navItems.map(({ to, page }) => (
            <Route
              key={to}
              path={to}
              element={
                <ProtectedRoute>
                  <AppLayout>
                    {page}
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          ))}

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <Navigate
                to={localStorage.getItem("userPreferences") ? "/dashboard" : "/"}
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
