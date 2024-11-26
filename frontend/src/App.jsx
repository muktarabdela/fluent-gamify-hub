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
import { useEffect } from 'react';
import { getTelegramUser } from "./utils/telegram";

const queryClient = new QueryClient();

// Protected Route component to handle redirects based on onboarding status
const ProtectedRoute = ({ children }) => {
  const userPreferences = localStorage.getItem("userPreferences");
  const telegramUser = getTelegramUser();

  useEffect(() => {
    if (telegramUser) {
      localStorage.setItem("user", JSON.stringify(telegramUser));
    }
  }, []);

  // Add debug display for Telegram user data
  return (
    <>
      {/* Debug display */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '5px',
        zIndex: 9999,
        maxWidth: '300px',
        fontSize: '12px'
      }}>
        <h4>Telegram User Data:</h4>
        <pre>{JSON.stringify(telegramUser, null, 2)}</pre>
      </div>

      {/* Existing protection logic */}
      {window.location.pathname === "/" && userPreferences ? (
        <Navigate to="/dashboard" replace />
      ) : window.location.pathname !== "/" && !userPreferences ? (
        <Navigate to="/" replace />
      ) : (
        children
      )}
    </>
  );
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
