import { Link } from "react-router-dom";
import logo from "../../public/fluent logo.png"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getUserById, getUserStreak } from "../api/userService";
import { getTelegramUser } from "../utils/telegram";
import { Heart } from 'lucide-react';

const ProfileInitial = ({ name, size = "text-sm" }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-yellow-500',
        'bg-red-500',
    ];

    const colorIndex = name ? name.length % colors.length : 0;
    const bgColor = colors[colorIndex];

    return (
        <div className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center`}>
            <span className={`${size} font-bold text-white`}>{initial}</span>
        </div>
    );
};

const Header = () => {
    const [streakData, setStreakData] = useState({ current_streak: 0, longest_streak: 0 });
    const telegramUser = getTelegramUser();
    const [userData, setUserData] = useState({ like_coins: 0 });

    useEffect(() => {
        const fetchStreak = async () => {
            try {
                if (telegramUser?.id) {
                    const data = await getUserStreak(telegramUser.id);
                    setStreakData(data);
                }
            } catch (error) {
                console.error("Failed to fetch streak data:", error);
            }
        };

        fetchStreak();
    }, [telegramUser]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (telegramUser?.id) {
                try {
                    const data = await getUserById(telegramUser.id);
                    setUserData(data);
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            }
        };

        fetchUserData();
    }, [telegramUser]);

    return (
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 shadow-sm">
            <div className="max-w-[430px] mx-auto px-3 py-2">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-4">
                        <img
                            src={logo}
                            alt="FluentHub"
                            className="h-9 w-auto transition-transform hover:scale-105"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center bg-gradient-to-r from-orange-100 to-orange-50 px-3 py-1.5 rounded-full cursor-pointer hover:from-orange-200 hover:to-orange-100 transition-colors">
                                    <span className="mr-1.5 animate-bounce">🔥</span>
                                    <p className="text-sm font-semibold text-orange-600">
                                        {streakData.current_streak} streak!
                                    </p>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Streak Details</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="p-2">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Current Streak</span>
                                            <span className="font-medium">{streakData.current_streak} days</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Longest Streak</span>
                                            <span className="font-medium">{streakData.longest_streak} days</span>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-pink-50 px-3 py-1.5 rounded-full">
                            <Heart className="w-4 h-4 text-pink-500 mr-1.5" />
                            <span className="text-sm font-semibold text-pink-600">
                                {userData.like_coins}
                            </span>
                        </div>

                        <Link to="/profile" className="flex items-center gap-3">
                            <div className="relative group w-11 h-11">
                                <div className="w-full h-full rounded-full overflow-hidden">

                                    <ProfileInitial name={telegramUser?.first_name} />

                                </div>
                                <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 