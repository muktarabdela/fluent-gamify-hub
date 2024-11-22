import Dashboard from "@/pages/Dashboard";
import Practice from "@/pages/Practice";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import LiveSession from "@/pages/LiveSession";

export const navItems = [
  { to: "/dashboard", page: <Dashboard /> },
  { to: "/practice", page: <Practice /> },
  { to: "/live-session", page: <LiveSession /> },
  { to: "/leaderboard", page: <Leaderboard /> },
  { to: "/profile", page: <Profile /> },
];