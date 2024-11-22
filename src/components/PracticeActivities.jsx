import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Cards, Video } from "lucide-react";

const practiceData = [
    {
        id: 1,
        title: "Shadowing Practice",
        description: "Improve pronunciation by speaking along with native speakers",
        icon: Headphones,
        type: "Audio",
        difficulty: "All Levels",
        lastScore: "92%",
    },
    {
        id: 2,
        title: "Vocabulary Flashcards",
        description: "Master essential words and phrases through spaced repetition",
        icon: Cards,
        type: "Interactive",
        difficulty: "Adaptive",
        lastScore: "85%",
    },
    {
        id: 3,
        title: "Video Questions",
        description: "Watch scenarios and answer comprehension questions",
        icon: Video,
        type: "Video",
        difficulty: "Intermediate",
        lastScore: "78%",
    },
];

const PracticeActivities = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Practice Activities</h2>
            {practiceData.map((activity) => (
                <Card key={activity.id} className="p-4 card-hover">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <activity.icon className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">{activity.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                <div>
                                    <span className="text-gray-600">Type: </span>
                                    <span>{activity.type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Level: </span>
                                    <span>{activity.difficulty}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Best: </span>
                                    <span className="text-primary">{activity.lastScore}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">
                                Start Practice
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default PracticeActivities; 