import { BookOpen, Trophy, UserRound, Activity } from "lucide-react";
import Index from "./pages/Index.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export const navItems = [
  {
    title: "Welcome",
    to: "/",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Onboarding",
    to: "/onboarding",
    icon: <Activity className="h-4 w-4" />,
    page: <Onboarding />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <Trophy className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Practice",
    to: "/practice",
    icon: <Activity className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Leaderboard",
    to: "/leaderboard",
    icon: <Trophy className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <UserRound className="h-4 w-4" />,
    page: <Dashboard />,
  },
];