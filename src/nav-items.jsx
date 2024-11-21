import { HomeIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export const navItems = [
  {
    title: "Welcome",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Onboarding",
    to: "/onboarding",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Onboarding />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Dashboard />,
  },
];