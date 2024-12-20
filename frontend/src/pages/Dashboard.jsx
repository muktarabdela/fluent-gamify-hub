import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Book, Users, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import Lessons from "@/components/Lessons";
const Dashboard = () => {
  return (
    <>
      <div className="bg-gr/20 py-2 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          <div className="space-y-3">
            <Lessons />
          </div>
        </div>
      </div>
      <Navigation />
    </>
  );
};

export default Dashboard;