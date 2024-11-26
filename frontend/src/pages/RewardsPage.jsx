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
            <h1 className="text-2xl font-bold mb-6">Rewards Program</h1>

            {/* Share Section */}
            <div className="bg-primary/10 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Invite Friends
                </h2>
                <p className="mb-4">Share Fluent Hub with your friends and earn amazing rewards!</p>
                <button
                    onClick={handleShare}
                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Share with Friends
                </button>
            </div>

            {/* Levels Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Reward Levels
                </h2>

                {rewardLevels.map((reward) => (
                    <div
                        key={reward.level}
                        className="border border-gray-200 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Level {reward.level}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{reward.requirement}</p>
                        <div className="space-y-1">
                            {reward.rewards.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
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