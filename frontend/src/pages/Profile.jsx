import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Settings, Award, History, BookMarked,
    Trophy, Target, Flame, BookOpen,
    BarChart3, Calendar, Clock, Star
} from "lucide-react";
import { getUserById, getUserProgress, getUserStreak } from "@/api/userService";
import { format } from "date-fns";
import { getTelegramUser } from "@/utils/telegram";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [userStreak, setUserStreak] = useState(null);
    const [loading, setLoading] = useState(true);
    const telegramUser = getTelegramUser();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                if (!telegramUser?.id) {
                    setLoading(false);
                    return;
                }

                const [userDetails, progress, streak] = await Promise.all([
                    getUserById(telegramUser.id),
                    getUserProgress(telegramUser.id),
                    getUserStreak(telegramUser.id)
                ]);

                setUserData(userDetails);
                setUserProgress(progress);
                setUserStreak(streak);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [telegramUser?.id]);

    if (loading) {
        return <ProfileSkeleton />;
    }

    const completedLessons = userProgress?.filter(p => p.status === 'completed')?.length || 0;
    const totalPoints = userProgress?.reduce((sum, p) => sum + (p.score || 0), 0) || 0;
    const averageScore = completedLessons > 0
        ? Math.round(totalPoints / completedLessons)
        : 0;
    const level = Math.floor(totalPoints / 100) + 1;
    const levelProgress = (totalPoints % 100);

    return (
        <div className="min-h-screen bg-[#243642]">
            {/* Header Section */}
            <div className="bg-gradient-to-b from-primary/20 to-[#243642] pt-6 pb-10">
                <div className="max-w-md mx-auto px-4">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 mx-auto mb-4 
                                          flex items-center justify-center ring-4 ring-[#1a2831] shadow-xl">
                                {userData?.photo_url ? (
                                    <img
                                        src={userData.photo_url}
                                        alt={userData.first_name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl text-white">
                                        {userData?.first_name?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-lg">
                                <Trophy className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mt-2">
                            {userData?.first_name} {userData?.last_name}
                        </h1>
                        <p className="text-gray-300">
                            Joined {format(new Date(userData?.created_at), 'MMMM yyyy')}
                        </p>
                    </div>

                    {/* Level Progress */}
                    <Card className="mt-6 p-4 bg-[#2c414f]/50 backdrop-blur-sm border-none shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Level {level}</span>
                            <span className="text-sm text-muted-foreground">{levelProgress}/100 XP</span>
                        </div>
                        <Progress value={levelProgress} className="h-2" />
                    </Card>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="max-w-md mx-auto px-4 -mt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <StatCard
                        icon={<Flame className="w-5 h-5 text-orange-500" />}
                        value={userStreak?.current_streak || 0}
                        label="Day Streak"
                        bgColor="bg-orange-500/10"
                    />
                    <StatCard
                        icon={<Star className="w-5 h-5 text-yellow-500" />}
                        value={averageScore}
                        label="Avg. Score"
                        suffix="%"
                        bgColor="bg-yellow-500/10"
                    />
                    <StatCard
                        icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
                        value={completedLessons}
                        label="Lessons"
                        bgColor="bg-emerald-500/10"
                    />
                    <StatCard
                        icon={<Target className="w-5 h-5 text-blue-500" />}
                        value={totalPoints}
                        label="Total Points"
                        bgColor="bg-blue-500/10"
                    />
                </div>

                {/* Action Cards */}
                <div className="space-y-4">
                    <ActionCard
                        icon={<BookMarked className="h-5 w-5 text-primary" />}
                        title="Saved Lessons"
                        description="Review your bookmarked lessons"
                    />
                    <ActionCard
                        icon={<History className="h-5 w-5 text-primary" />}
                        title="Learning History"
                        description="Track your learning journey"
                    />
                    <ActionCard
                        icon={<BarChart3 className="h-5 w-5 text-primary" />}
                        title="Progress Analytics"
                        description="View detailed statistics"
                    />
                    <ActionCard
                        icon={<Settings className="h-5 w-5 text-primary" />}
                        title="Settings"
                        description="Customize your experience"
                    />
                </div>
            </div>
            <Navigation />
        </div>
    );
};

const StatCard = ({ icon, value, label, suffix = "", bgColor }) => (
    <Card className="p-4 border-none shadow-md bg-[#2c414f]/50 backdrop-blur-sm">
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mb-2`}>
            {icon}
        </div>
        <div className="font-bold text-2xl">
            {value}{suffix}
        </div>
        <div className="text-sm text-muted-foreground">
            {label}
        </div>
    </Card>
);

const ActionCard = ({ icon, title, description }) => (
    <Card className="p-4 border-none shadow-md hover:shadow-lg transition-all bg-[#2c414f]/50 backdrop-blur-sm hover:bg-[#2c414f]/70">
        <Button variant="ghost" className="w-full justify-start space-x-3 h-auto py-2 text-white hover:text-white/90">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                {icon}
            </div>
            <div className="text-left">
                <div className="font-semibold">{title}</div>
                <div className="text-sm text-gray-300">{description}</div>
            </div>
        </Button>
    </Card>
);

const ProfileSkeleton = () => (
    <div className="min-h-screen bg-[#243642]">
        <div className="bg-gradient-to-b from-primary/20 to-[#243642] pt-6 pb-10">
            <div className="max-w-md mx-auto px-4">
                <div className="text-center">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-48 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
                <Skeleton className="h-16 w-full mt-6" />
            </div>
        </div>
        <div className="max-w-md mx-auto px-4 -mt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-28 w-full" />
                ))}
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        </div>
    </div>
);

export default Profile; 