import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Settings, Award, History, BookMarked,
    Trophy, Target, Flame, BookOpen,
    BarChart3, Calendar, Clock, Star
    , Heart
} from "lucide-react";

import { getLessonStatusByUserId, getUserById, getUserStreak } from "@/api/userService";
import { format } from "date-fns";
import { getTelegramUser } from "@/utils/telegram";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [userStreak, setUserStreak] = useState(null);
    const [userLesson, setUserLesson] = useState(null)
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
                const [userDetails, progress, streak, lesson] = await Promise.all([
                    getUserById(telegramUser.id),
                    // getUserProgress(telegramUser.id),
                    getUserStreak(telegramUser.id),
                    getLessonStatusByUserId(telegramUser.id)
                ]);

                console.log("Fetched user details:", userDetails);
                // console.log("Fetched user progress:", progress);
                console.log("Fetched user streak:", streak);
                console.log("Fetched user lesson data:", lesson);

                setUserData(userDetails);
                // setUserProgress(progress);
                setUserStreak(streak);
                setUserLesson(lesson)
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

    // const completedLessons = userProgress?.filter(p => p.status === 'completed')?.length || 0;
    // const totalPoints = userProgress?.reduce((sum, p) => sum + (p.score || 0), 0) || 0;
    const totalLikes = userData?.like_coins

    // const averageScore = completedLessons > 0
    //     ? Math.round(totalPoints / completedLessons)
    //     : 0;
    // const level = Math.floor(totalPoints / 100) + 1;
    // const levelProgress = (totalPoints % 100);

    // Calculate the counts and progress
    const totalLessons = userLesson.length;
    const completedLessonsS = userLesson.filter(lesson => lesson.status === 'completed').length;
    const activeLessons = userLesson.filter(lesson => lesson.status === 'active').length;
    const lockedLessons = userLesson.filter(lesson => lesson.status === 'locked').length;

    const overallProgress = totalLessons > 0 ? Math.round((completedLessonsS / totalLessons) * 100) : 0;

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
                    {/* <Card className="mt-6 p-4 bg-[#2c414f]/50 backdrop-blur-sm border-none shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Level {level}</span>
                            <span className="text-sm text-muted-foreground">{levelProgress}/100 XP</span>
                        </div>
                        <Progress value={levelProgress} className="h-2" />
                    </Card> */}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="max-w-md mx-auto px-4 -mt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <StatCard
                        icon={<Flame className="w-6 h-6 text-orange-500" />}
                        value={userStreak?.current_streak || 0}
                        label="Day Streak"
                        bgColor="bg-orange-500/20"
                        textColor="text-orange-400"
                    />
                    {/* <StatCard
                        icon={<Star className="w-6 h-6 text-yellow-500" />}
                        value={averageScore}
                        label="Avg. Score"
                        suffix="%"
                        bgColor="bg-yellow-500/20"
                        textColor="text-yellow-400"
                    /> */}
                    <StatCard
                        icon={<BookOpen className="w-6 h-6 text-emerald-500" />}
                        value={completedLessonsS}
                        label="Completed Lessons"
                        bgColor="bg-emerald-500/20"
                        textColor="text-emerald-400"
                    />
                    {/* <StatCard
                        icon={<Target className="w-6 h-6 text-blue-500" />}
                        value={totalPoints}
                        label="Total Points"
                        bgColor="bg-blue-500/20"
                        textColor="text-blue-400"
                    /> */}
                    <StatCard
                        icon={<Heart className="w-6 h-6 text-pink-500" />}
                        value={totalLikes}
                        label="Total Likes"
                        bgColor="bg-pink-500/20"
                        textColor="text-pink-400"
                    />
                </div>
                <div className="mb-24">
                    <div className="max-w-2xl mx-auto px-4 py-8 bg--950 rounded-xl shadow-2xl">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Lesson Progress</h2>
                        <div className="space-y-6">
                            <ProgressCar
                                title="Completed Lessons"
                                current={completedLessonsS}
                                total={totalLessons}
                                percentage={(completedLessonsS / totalLessons) * 100}
                                color="bg-emerald-500"
                            />
                            <ProgressCar
                                title="Active Lessons"
                                current={activeLessons}
                                total={totalLessons}
                                percentage={(activeLessons / totalLessons) * 100}
                                color="bg-gray-500"
                            />
                            <ProgressCar
                                title="Locked Lessons"
                                current={lockedLessons}
                                total={totalLessons}
                                percentage={(lockedLessons / totalLessons) * 100}
                                color="bg-gray-500"
                            />
                        </div>
                        <div className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-inner">
                            <h3 className="text-xl font-semibold text-white mb-4">Overall Progress</h3>
                            <Progress value={overallProgress} className="h-3 bg-gray-700" />
                            <div className="text-sm text-gray-300 mt-2 flex justify-between items-center">
                                <span>Completion Rate</span>
                                <span className="font-medium text-white">{overallProgress.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Action Cards */}
                {/* <div className="space-y-4">
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
                </div> */}
            </div>
            <Navigation />
        </div>
    );
};

const StatCard = ({ icon, value, label, suffix = '', bgColor, textColor }) => (
    <Card className="overflow-hidden">
        <CardContent className="p-6 bg-gradient-to-br from-gray-900 to-gray-800">
            <div className={`${bgColor} w-10 h-12 rounded-lg flex items-center justify-center mb-4 transform -rotate-12 shadow-lg`}>
                {icon}
            </div>
            <div className={`${textColor} font-bold text-3xl mb-1`}>
                {value}{suffix}
            </div>
            <div className="text-sm text-gray-400 font-medium">
                {label}
            </div>
        </CardContent>
    </Card>

);

const ProgressCar = ({ title, current, total, percentage, color }) => (
    <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-white">{title}</h3>
                <span className="text-sm font-medium text-gray-300">{current} / {total}</span>
            </div>
            <Progress value={percentage} className={`h-2 ${color}`} />
            <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                <span>{title}</span>
                <span className="font-medium text-white">{percentage.toFixed(1)}%</span>
            </div>
        </CardContent>
    </Card>
)

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
                    {/* <Skeleton className="h-8 w-48 mx-auto mb-2" /> */}
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