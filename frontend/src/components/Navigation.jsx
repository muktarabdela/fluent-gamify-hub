import React from "react";
import { useLocation, Link } from "react-router-dom";
import { BookOpen, Trophy, UserRound, Activity, Video, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: BookOpen, label: "Learn", path: "/dashboard" },
    { icon: Video, label: "Live", path: "/live-session" },
    { icon: Activity, label: "Practice", path: "/practice" },
    { icon: Bookmark, label: "Saved", path: "/saved" },
    { icon: Trophy, label: "Rewards", path: "/rewards" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 z-50 shadow-lg">
      <div className="max-w-[430px] mx-auto">
        <div className="flex justify-between items-center relative">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center p-2.5 min-w-[4rem] relative rounded-xl transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-500 hover:text-primary hover:bg-gray-100"
                )}
              >
                <Icon className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium mt-1 transition-colors",
                  isActive ? "text-primary" : "text-gray-600"
                )}>{label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
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

