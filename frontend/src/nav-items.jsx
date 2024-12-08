import Dashboard from "@/pages/Dashboard";
import Practice from "@/pages/Practice";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import LiveSession from "@/pages/LiveSession";
import RewardsPage from "@/pages/RewardsPage";
import SavedPage from "@/pages/SavedPage";

export const navItems = [
  { to: "/dashboard", page: <Dashboard /> },
  // { to: "/practice", page: <Practice /> },
  { to: "/live-session", page: <LiveSession /> },
  // { to: "/saved", page: <SavedPage /> },
  { to: "/rewards", page: <RewardsPage /> },
  { to: "/profile", page: <Profile /> },
];