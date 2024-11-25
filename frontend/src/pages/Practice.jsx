import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MessageSquare, Book, Brain } from "lucide-react";
import logo from "../../public/fluent logo.png";

const Practice = () => {
    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4 pb-20">
                <div className="max-w-md mx-auto space-y-4">
                    <h1 className="text-2xl font-bold mb-6">Practice Your Skills</h1>

                    <Card className="p-4 card-hover">
                        <div className="flex items-center space-x-3 mb-3">
                            <Mic className="h-6 w-6 text-primary" />
                            <h2 className="text-lg font-semibold">Speaking Practice</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Practice pronunciation and speaking</p>
                        <Button className="w-full">Start Speaking</Button>
                    </Card>

                    <Card className="p-4 card-hover">
                        <div className="flex items-center space-x-3 mb-3">
                            <MessageSquare className="h-6 w-6 text-accent" />
                            <h2 className="text-lg font-semibold">Conversation Practice</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Practice with AI conversation partner</p>
                        <Button className="w-full">Start Conversation</Button>
                    </Card>

                    <Card className="p-4 card-hover">
                        <div className="flex items-center space-x-3 mb-3">
                            <Brain className="h-6 w-6 text-yellow-500" />
                            <h2 className="text-lg font-semibold">Vocabulary Quiz</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Test your vocabulary knowledge</p>
                        <Button className="w-full">Start Quiz</Button>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Practice; 