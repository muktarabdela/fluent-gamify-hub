import React from "react";
import { useLocation, Link } from "react-router-dom";
import { BookOpen, Trophy, UserRound, Activity, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: BookOpen, label: "Learn", path: "/dashboard" },
    { icon: Video, label: "Live", path: "/live-session" },
    { icon: Activity, label: "Practice", path: "/practice" },
    { icon: Trophy, label: "Ranks", path: "/leaderboard" },
    { icon: UserRound, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-1 z-50">
      <div className="max-w-[430px] mx-auto">
        <div className="flex justify-between items-center relative">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center p-2 min-w-[3.5rem] relative",
                  isActive ? "text-primary" : "text-gray-500 hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

