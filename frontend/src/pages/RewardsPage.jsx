import React from "react";
import { Share2, Award, Gift, Users, Heart, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { getAllUsers } from "../api/userService";

const RewardsPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const users = await getAllUsers();
                const sortedUsers = users.sort((a, b) => b.like_coins - a.like_coins);
                setLeaderboard(sortedUsers.slice(0, 10)); // Top 10 users
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            }
        };

        fetchLeaderboard();
    }, []);

    const rewardLevels = [
        {
            level: 1,
            requirement: "Invite 5 friends",
            rewards: ["Access to premium practice exercises", "Special badge"],
        },
        {
            level: 2,
            requirement: "Invite 10 friends",
            rewards: ["Unlock advanced features", "Monthly challenge participation"],
        },
        {
            level: 3,
            requirement: "Invite 25 friends",
            rewards: ["Enter monthly prize draws", "Exclusive learning materials"],
        },
    ];

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Join me on Fluent Hub!',
                    text: 'Learn languages in a fun and interactive way. Join me on Fluent Hub!',
                    url: window.location.origin,
                });
            } else {
                // Fallback for browsers that don't support the Web Share API
                navigator.clipboard.writeText(window.location.origin);
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // return (
    //     <div className="max-w-[430px] mx-auto p-4 mb-20">
    //         <h1 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-2">
    //             <Award className="w-7 h-7 text-primary" />
    //             Rewards Program
    //         </h1>

    //         <Tabs defaultValue="rewards" className="mb-8">
    //             <TabsList className="grid w-full grid-cols-2">
    //                 <TabsTrigger value="rewards" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-800">Rewards</TabsTrigger>
    //                 <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-800">Leaderboard</TabsTrigger>
    //             </TabsList>

    //             <TabsContent value="rewards">
    //                 {/* Share Section - Updated styling */}
    //                 <div className="bg-gray-100 backdrop-blur-sm shadow-sm rounded-xl p-6 mb-8 border border-primary/10">
    //                     <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
    //                         <Share2 className="w-5 h-5 text-primary" />
    //                         Invite Friends
    //                     </h2>
    //                     <p className="mb-4 text-gray-600">
    //                         Share Fluent Hub with your friends and earn amazing rewards!
    //                     </p>
    //                     <button
    //                         onClick={handleShare}
    //                         className="w-full bg-primary text-white py-3 rounded-lg font-medium 
    //                                  hover:bg-primary/90 transition-all duration-200 
    //                                  shadow-sm hover:shadow-md active:scale-98"
    //                     >
    //                         Share with Friends
    //                     </button>
    //                 </div>

    //                 {/* Levels Section - Updated styling */}
    //                 <div className="space-y-4">
    //                     <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-100 mb-6">
    //                         <Award className="w-5 h-5 text-primary" />
    //                         Reward Levels
    //                     </h2>

    //                     {rewardLevels.map((reward) => (
    //                         <div
    //                             key={reward.level}
    //                             className="bg-gray-100 backdrop-blur-sm border border-primary/10 
    //                                      rounded-xl p-5 hover:bg-white hover:shadow-md 
    //                                      transition-all duration-200"
    //                         >
    //                             <div className="flex items-center gap-2 mb-3">
    //                                 <div className="bg-primary/10 p-2 rounded-lg">
    //                                     <Users className="w-5 h-5 text-primary" />
    //                                 </div>
    //                                 <h3 className="font-semibold text-gray-800">
    //                                     Level {reward.level}
    //                                 </h3>
    //                             </div>
    //                             <p className="text-gray-600 mb-4 text-sm">
    //                                 {reward.requirement}
    //                             </p>
    //                             <div className="space-y-2">
    //                                 {reward.rewards.map((item, index) => (
    //                                     <div
    //                                         key={index}
    //                                         className="flex items-center gap-3 text-sm text-gray-700 
    //                                                  bg-primary/20 p-2 rounded-lg"
    //                                     >
    //                                         <Gift className="w-4 h-4 text-primary" />
    //                                         <span>{item}</span>
    //                                     </div>
    //                                 ))}
    //                             </div>
    //                         </div>
    //                     ))}
    //                 </div>
    //             </TabsContent>

    //             <TabsContent value="leaderboard">
    //                 <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6 border border-primary/10">
    //                     <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
    //                         <Trophy className="w-5 h-5 text-primary" />
    //                         Top Learners
    //                     </h2>
    //                     <div className="space-y-4">
    //                         {leaderboard.map((user, index) => (
    //                             <div
    //                                 key={user.user_id}
    //                                 className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
    //                             >
    //                                 <div className="flex items-center gap-3">
    //                                     <span className={`w-6 h-6 flex items-center justify-center rounded-full ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
    //                                         } font-semibold text-sm`}>
    //                                         {index + 1}
    //                                     </span>
    //                                     <span className="font-medium">{user.first_name}</span>
    //                                 </div>
    //                                 <div className="flex items-center gap-2">
    //                                     <Heart className="w-4 h-4 text-pink-500" />
    //                                     <span className="font-semibold text-pink-600">{user.like_coins}</span>
    //                                 </div>
    //                             </div>
    //                         ))}
    //                     </div>
    //                 </div>
    //             </TabsContent>
    //         </Tabs>
    //     </div>
    // );
    return (
        <div className="max-w-[430px] mx-auto p-4 mb-20">
            <h1 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-2">
                <Award className="w-7 h-7 text-primary" />
                Rewards Program
            </h1>
            <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-gray-700">
                <p className="text-2xl font-semibold text-gray-100 mb-2">Coming Soon</p>
                <p className="text-gray-400">We're working on something exciting for you!</p>
            </div>
        </div>
    );
};

export default RewardsPage; 