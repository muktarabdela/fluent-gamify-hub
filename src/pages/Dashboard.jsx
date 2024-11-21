import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Book, Users, Zap } from "lucide-react";

const Dashboard = () => {
  const userPreferences = JSON.parse(localStorage.getItem("userPreferences") || "{}");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Welcome to FluentHub</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">Daily Streak</p>
              <p className="text-2xl font-bold text-accent">🔥 3 days</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Points</p>
              <p className="text-2xl font-bold text-primary">150 XP</p>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 card-hover">
            <div className="flex items-center space-x-4 mb-4">
              <Book className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold">Continue Learning</h2>
            </div>
            <Progress value={33} className="mb-4" />
            <p className="text-sm text-gray-600 mb-4">Lesson 3: Ordering Food</p>
            <Button className="w-full">Continue</Button>
          </Card>

          <Card className="p-6 card-hover">
            <div className="flex items-center space-x-4 mb-4">
              <Users className="h-8 w-8 text-accent" />
              <h2 className="text-xl font-semibold">Join Group Class</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Next class in 2 hours</p>
            <Button variant="outline" className="w-full">View Schedule</Button>
          </Card>

          <Card className="p-6 card-hover">
            <div className="flex items-center space-x-4 mb-4">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h2 className="text-xl font-semibold">Achievements</h2>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-gray-600">3/5 achievements unlocked</p>
            </div>
            <Button variant="outline" className="w-full">View All</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;