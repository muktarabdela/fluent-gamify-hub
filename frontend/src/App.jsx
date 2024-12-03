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
import { useEffect, useState } from 'react';
import { getTelegramUser, validateTelegramWebApp } from "./utils/telegram";
import { getUserById } from "./api/userService";
import AdminDashboard from './pages/admin/Dashboard';
import AdminUnits from './pages/admin/Units';
import AdminLessons from './pages/admin/Lessons';
import AdminQuickLessons from './pages/admin/QuickLessons';
import AdminExercises from './pages/admin/Exercises';
import AdminPractice from './pages/admin/Practice';
import AdminUsers from './pages/admin/Users';
import AdminTelegramGroups from './pages/admin/TelegramGroups';
import AdminLiveSessions from './pages/admin/LiveSessions';

const queryClient = new QueryClient();

// Protected Route component to handle redirects based on onboarding status
const ProtectedRoute = ({ children }) => {
  const telegramUser = getTelegramUser();
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (telegramUser?.id) {
        try {
          const userData = await getUserById(telegramUser.id);
          if (userData.onboarding_completed) {
            setUserPreferences(userData);
            localStorage.setItem("userPreferences", JSON.stringify({
              country: userData.country,
              interests: userData.interests
            }));
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }
    };

    fetchUserPreferences();
  }, [telegramUser]);

  // If trying to access onboarding page but already completed
  if (window.location.pathname === "/" && userPreferences?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  // If trying to access any other page but haven't completed onboarding
  if (window.location.pathname !== "/" && !userPreferences?.onboarding_completed) {
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

const App = () => {
  // useEffect(() => {
  //   try {
  //     // Validate Telegram WebApp on mount
  //     if (import.meta.env.VITE_API_URL.NODE_ENV !== 'development') {
  //       validateTelegramWebApp();
  //     }
  //   } catch (error) {
  //     console.error('Telegram WebApp validation failed:', error);
  //     // Handle validation failure (e.g., show error message)
  //   }
  // }, []);

  return (
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

            <Route path="/admin" element={<AdminDashboard />}>
              <Route path="units" element={<AdminUnits />} />
              <Route path="lessons" element={<AdminLessons />} />
              <Route path="quick-lessons" element={<AdminQuickLessons />} />
              <Route path="exercises" element={<AdminExercises />} />
              <Route path="practice" element={<AdminPractice />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="telegram-groups" element={<AdminTelegramGroups />} />
              <Route path="live-sessions" element={<AdminLiveSessions />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
