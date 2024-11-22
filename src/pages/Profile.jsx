import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Award, History, BookMarked } from "lucide-react";
import logo from "../../public/fluent logo.png";

const Profile = () => {
    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4 pb-20">
                <div className="max-w-md mx-auto space-y-4">
                    <div className="text-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-3xl">👤</span>
                        </div>
                        <h1 className="text-2xl font-bold">User Name</h1>
                        <p className="text-gray-600">Joined December 2023</p>
                    </div>

                    <Card className="p-4 card-hover">
                        <div className="flex items-center space-x-3 mb-3">
                            <Award className="h-6 w-6 text-primary" />
                            <div>
                                <h2 className="text-lg font-semibold">Your Stats</h2>
                                <p className="text-sm text-gray-600">Current Level: 5</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="font-bold">150</p>
                                <p className="text-xs text-gray-600">Points</p>
                            </div>
                            <div>
                                <p className="font-bold">3</p>
                                <p className="text-xs text-gray-600">Day Streak</p>
                            </div>
                            <div>
                                <p className="font-bold">12</p>
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
        </>
    );
};

export default Profile; 