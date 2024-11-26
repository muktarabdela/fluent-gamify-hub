import React from "react";
import { Share2, Award, Gift, Users } from "lucide-react";

const RewardsPage = () => {
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

    return (
        <div className="max-w-[430px] mx-auto p-4 mb-20">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Award className="w-7 h-7 text-primary" />
                Rewards Program
            </h1>

            {/* Share Section - Updated styling */}
            <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6 mb-8 border border-primary/10">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Share2 className="w-5 h-5 text-primary" />
                    Invite Friends
                </h2>
                <p className="mb-4 text-gray-600">
                    Share Fluent Hub with your friends and earn amazing rewards!
                </p>
                <button
                    onClick={handleShare}
                    className="w-full bg-primary text-white py-3 rounded-lg font-medium 
                             hover:bg-primary/90 transition-all duration-200 
                             shadow-sm hover:shadow-md active:scale-98"
                >
                    Share with Friends
                </button>
            </div>

            {/* Levels Section - Updated styling */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-6">
                    <Award className="w-5 h-5 text-primary" />
                    Reward Levels
                </h2>

                {rewardLevels.map((reward) => (
                    <div
                        key={reward.level}
                        className="bg-white/80 backdrop-blur-sm border border-primary/10 
                                 rounded-xl p-5 hover:bg-white hover:shadow-md 
                                 transition-all duration-200"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-gray-800">
                                Level {reward.level}
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">
                            {reward.requirement}
                        </p>
                        <div className="space-y-2">
                            {reward.rewards.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center gap-3 text-sm text-gray-700 
                                             bg-primary/5 p-2 rounded-lg"
                                >
                                    <Gift className="w-4 h-4 text-primary" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RewardsPage; 