import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const welcomeScreens = [
    {
        title: "Welcome to FluentHub",
        description: "Your gateway to mastering languages through immersive learning experiences.",
        image: "/placeholder.svg?height=200&width=200"
    },
    {
        title: "Personalized Learning Paths",
        description: "FluentHub adapts to your learning style and goals, creating a tailored journey for you.",
        image: "/placeholder.svg?height=200&width=200"
    },
    {
        title: "Interactive Lessons",
        description: "Engage with native speakers and AI-powered conversations to enhance your skills.",
        image: "/placeholder.svg?height=200&width=200"
    },
    {
        title: "Track Your Progress",
        description: "Monitor your improvement with detailed analytics and achievement milestones.",
        image: "/placeholder.svg?height=200&width=200"
    }
];

const WelcomeScreens = ({ onComplete }) => {
    const [currentScreen, setCurrentScreen] = useState(0);

    const handleNext = () => {
        if (currentScreen < welcomeScreens.length - 1) {
            setCurrentScreen(currentScreen + 1);
        } else {
            onComplete();
        }
    };

    const screen = welcomeScreens[currentScreen];

    return (
        <Card className="w-full max-w-md p-6 animate-fade-in">
            <div className="space-y-6 text-center">
                <img src={screen.image} alt={screen.title} className="mx-auto w-32 h-32" />
                <h2 className="text-2xl font-bold text-primary">{screen.title}</h2>
                <p className="text-gray-600">{screen.description}</p>
                <div className="flex justify-between items-center">
                    <div className="space-x-2">
                        {welcomeScreens.map((_, index) => (
                            <span
                                key={index}
                                className={`inline-block w-2 h-2 rounded-full ${index === currentScreen ? 'bg-primary' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <Button onClick={handleNext}>
                        {currentScreen < welcomeScreens.length - 1 ? 'Next' : 'Get Started'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default WelcomeScreens;

