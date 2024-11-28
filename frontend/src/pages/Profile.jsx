import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Award, History, BookMarked } from "lucide-react";
import { getUserById, getUserProgress, getUserStreak } from "@/api/userService";
import { format } from "date-fns";
import { getTelegramUser } from "@/utils/telegram";
import { Skeleton } from "@/components/ui/skeleton";

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

    return (
        <>
            <div className="min-h-screen bp-4 pb-20">
                <div className="max-w-md mx-auto space-y-4">
                    <div className="text-center mb-6">
                        {/* <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                            {userData?.photo_url ? (
                                <img 
                                    src={userData.photo_url} 
                                    alt={userData.first_name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl">👤</span>
                            )}
                        </div> */}
                        <h1 className="text-2xl font-bold text-gray-100">
                            {userData?.first_name} {userData?.last_name}
                        </h1>
                        <p className="text-gray-300">
                            Joined {format(new Date(userData?.created_at), 'MMMM yyyy')}
                        </p>
                    </div>

                    <Card className="p-4 card-hover bg-secondary">
                        <div className="flex items-center space-x-3 mb-3">
                            <Award className="h-6 w-6 text-primary" />
                            <div>
                                <h2 className="text-lg font-semibold">Your Stats</h2>
                                <p className="text-sm text-gray-600">
                                    Level {Math.floor(totalPoints / 100) + 1}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="font-bold">{totalPoints}</p>
                                <p className="text-xs text-gray-600">Points</p>
                            </div>
                            <div>
                                <p className="font-bold">{userStreak?.current_streak || 0}</p>
                                <p className="text-xs text-gray-600">Day Streak</p>
                            </div>
                            <div>
                                <p className="font-bold">{completedLessons}</p>
                                <p className="text-xs text-gray-600">Lessons</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 card-hover">
                        <div className="flex items-center space-x-3 mb-3">
                            <BookMarked className="h-6 w-6 text-accent" />
                            <h2 className="text-lg font-semibold">Saved Lessons</h2>
                        </div>
                        <Button variant="outline" className="w-full">View Saved</Button>
                    </Card>

                    <Card className="p-4 card-hover">
                        <div className="flex items-center space-x-3 mb-3">
                            <History className="h-6 w-6 text-yellow-500" />
                            <h2 className="text-lg font-semibold">Learning History</h2>
                        </div>
                        <Button variant="outline" className="w-full">View History</Button>
                    </Card>

                    <Card className="p-4 card-hover">
                        <div className="flex items-center space-x-3 mb-3">
                            <Settings className="h-6 w-6 text-gray-500" />
                            <h2 className="text-lg font-semibold">Settings</h2>
                        </div>
                        <Button variant="outline" className="w-full">Open Settings</Button>
                    </Card>
                </div>
            </div>
            <Navigation />
        </>
    );
};

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4 pb-20">
            <div className="max-w-md mx-auto space-y-4">
                <div className="text-center mb-6">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-48 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
                {/* Add more skeleton components for cards */}
            </div>
        </div>
    );
};

export default Profile; 