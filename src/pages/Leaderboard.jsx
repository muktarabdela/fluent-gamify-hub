import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Crown, Trophy, Medal } from "lucide-react";
import logo from "../../public/fluent logo.png";

const Leaderboard = () => {
    const topUsers = [
        { name: "Sarah Chen", points: 2500, streak: 15 },
        { name: "John Smith", points: 2350, streak: 12 },
        { name: "Maria Garcia", points: 2200, streak: 10 },
        { name: "David Kim", points: 2100, streak: 8 },
        { name: "Lisa Wang", points: 2000, streak: 7 },
    ];

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4 pb-20">
                <div className="max-w-md mx-auto space-y-4">
                    <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

                    {topUsers.map((user, index) => (
                        <Card key={index} className="p-4 card-hover">
                            <div className="flex items-center space-x-4">
                                {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                                {index === 1 && <Trophy className="h-6 w-6 text-gray-400" />}
                                {index === 2 && <Medal className="h-6 w-6 text-amber-700" />}
                                {index > 2 && <span className="w-6 text-center font-bold">{index + 1}</span>}

                                <div className="flex-1">
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-sm text-gray-600">🔥 {user.streak} day streak</p>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold text-primary">{user.points}</p>
                                    <p className="text-xs text-gray-600">points</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Leaderboard; 