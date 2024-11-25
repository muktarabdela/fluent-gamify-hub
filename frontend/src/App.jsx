import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { navItems } from "./nav-items";
import Onboarding from "@/pages/Onboarding";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import LessonDetail from "./pages/LessonDetail";
import TelegramAuth from '@/auth/TelegramAuth';

const queryClient = new QueryClient();

// Protected Route component to handle redirects based on onboarding status
const ProtectedRoute = ({ children }) => {
  const userPreferences = localStorage.getItem("userPreferences");
  const user = localStorage.getItem("user");

  // If no user is logged in, show Telegram auth
  if (!user) {
    return <TelegramAuth />;
  }

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
  const location = useLocation();
  // Don't show header/nav on onboarding page or lesson pages
  const isOnboarding = window.location.pathname === "/";
  const isLessonPage = location.pathname.includes('/lesson/');

  return (
    <>
      {!isOnboarding && !isLessonPage && <Header />}
      {children}
      {!isOnboarding && !isLessonPage && <Navigation />}
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

          {/* Detail Lesson Route */}
          <Route
            path="/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LessonDetail />
                </AppLayout>
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
