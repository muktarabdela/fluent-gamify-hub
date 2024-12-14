import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const welcomeScreens = [
    {
        title: "🎉 Learn English Smarter, Faster, and More Fun!",
        description: "Right on Telegram! Unlock new opportunities with engaging and effective learning experiences.",
        image: "/placeholder.svg?height=200&width=200"
    },
    {
        title: "🎙️ Practice with Real People",
        description: "Join live voice chats on real-world topics and boost your confidence by talking to humans, not bots!",
        image: "/placeholder.svg?height=200&width=200"
    },
    {
        title: "📚 Learn What Matters",
        description: "Skip the fluff and focus on useful, real-life English to achieve your goals faster.",
        image: "/placeholder.svg?height=200&width=200"
    },
    {
        title: "🏆 Stay Motivated",
        description: "Earn coins, keep streaks alive, and track your progress with detailed reports.",
        image: "/placeholder.svg?height=200&width=200"
    },
    {
        title: "🌟 No App-Hopping Needed",
        description: "Everything happens right here on Telegram! One platform, endless possibilities.",
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
                {/* Placeholder for an image or illustration */}
                {/* <img src={screen.image} alt={screen.title} className="mx-auto w-32 h-32" /> */}
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
