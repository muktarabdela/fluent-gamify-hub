import { useLocation, Link } from "react-router-dom";
import { BookOpen, Trophy, UserRound, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: BookOpen, label: "Learn", path: "/dashboard" },
    { icon: Activity, label: "Practice", path: "/practice" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: UserRound, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1">
      <div className="flex justify-around items-center">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center p-2 min-w-[4rem]",
              location.pathname === path
                ? "text-primary"
                : "text-gray-500 hover:text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;