import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Book, Users, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const userPreferences = JSON.parse(localStorage.getItem("userPreferences") || "{}");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          <header className="space-y-3">
            <div className="flex items-center">
              <img 
                src="/fluenthub-logo.png" 
                alt="FluentHub" 
                className="h-8 w-auto"
              />
            </div>
            <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium">Daily Streak</p>
                <p className="text-xl font-bold text-accent">🔥 3 days</p>
              </div>
              <div>
                <p className="text-sm font-medium">Points</p>
                <p className="text-xl font-bold text-primary">150 XP</p>
              </div>
            </div>
          </header>

          <div className="space-y-3">
            <Card className="p-4 card-hover">
              <div className="flex items-center space-x-3 mb-3">
                <Book className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">Continue Learning</h2>
              </div>
              <Progress value={33} className="mb-3" />
              <p className="text-sm text-gray-600 mb-3">Lesson 3: Ordering Food</p>
              <Button className="w-full">Continue</Button>
            </Card>

            <Card className="p-4 card-hover">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="h-6 w-6 text-accent" />
                <h2 className="text-lg font-semibold">Join Group Class</h2>
              </div>
              <p className="text-sm text-gray-600 mb-3">Next class in 2 hours</p>
              <Button variant="outline" className="w-full">View Schedule</Button>
            </Card>

            <Card className="p-4 card-hover">
              <div className="flex items-center space-x-3 mb-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h2 className="text-lg font-semibold">Achievements</h2>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="h-4 w-4 text-yellow-500" />
                <p className="text-sm text-gray-600">3/5 achievements unlocked</p>
              </div>
              <Button variant="outline" className="w-full">View All</Button>
            </Card>
          </div>
        </div>
      </div>
      <Navigation />
    </>
  );
};

export default Dashboard;