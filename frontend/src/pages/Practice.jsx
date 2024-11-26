import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
    Mic, 
    MessageSquare, 
    BookOpen,
    Headphones,
    ScrollText,
    Gamepad2,
} from "lucide-react";

const practiceCategories = [
    {
        title: "Vocabulary Practice",
        description: "Improve your word power",
        icon: BookOpen,
        color: "text-blue-500",
        exercises: [
            { name: "Flashcards", description: "Learn new words with spaced repetition" },
            { name: "Word Association", description: "Connect related words and concepts" },
            { name: "Picture Dictionary", description: "Learn words through images" },
            { name: "Word Games", description: "Fun games to expand vocabulary" }
        ]
    },
    {
        title: "Pronunciation Training",
        description: "Perfect your accent and speech",
        icon: Mic,
        color: "text-red-500",
        exercises: [
            { name: "Word Pronunciation", description: "Practice individual word sounds" },
            { name: "Tongue Twisters", description: "Improve pronunciation accuracy" },
            { name: "Speech Recognition", description: "Get instant pronunciation feedback" },
            { name: "Minimal Pairs", description: "Practice similar-sounding words" }
        ]
    },
    {
        title: "Listening Skills",
        description: "Enhance your comprehension",
        icon: Headphones,
        color: "text-purple-500",
        exercises: [
            { name: "Audio Stories", description: "Listen to native conversations" },
            { name: "Dictation Practice", description: "Write what you hear" },
            { name: "Song Lyrics", description: "Learn through music" },
            { name: "News Broadcasts", description: "Practice with real-world content" }
        ]
    },
    {
        title: "Grammar Exercises",
        description: "Master language structure",
        icon: ScrollText,
        color: "text-green-500",
        exercises: [
            { name: "Sentence Building", description: "Create correct sentences" },
            { name: "Error Correction", description: "Find and fix mistakes" },
            { name: "Tense Practice", description: "Master verb tenses" },
            { name: "Grammar Quizzes", description: "Test your knowledge" }
        ]
    },
    {
        title: "Speaking Practice",
        description: "Build conversation skills",
        icon: MessageSquare,
        color: "text-yellow-500",
        exercises: [
            { name: "AI Conversations", description: "Chat with AI language partners" },
            { name: "Role-play Scenarios", description: "Practice real-life situations" },
            { name: "Speech Recording", description: "Record and analyze your speech" },
            { name: "Debate Topics", description: "Practice expressing opinions" }
        ]
    },
    {
        title: "Interactive Games",
        description: "Learn while having fun",
        icon: Gamepad2,
        color: "text-orange-500",
        exercises: [
            { name: "Word Puzzles", description: "Solve language-based puzzles" },
            { name: "Memory Games", description: "Test your recall abilities" },
            { name: "Language Quests", description: "Complete learning missions" },
            { name: "Multiplayer Challenges", description: "Compete with others" }
        ]
    }
];

const Practice = () => {
    const [selectedCategory, setSelectedCategory] = useState(practiceCategories[0]);
    const scrollContainerRef = useRef(null);

    const handleCategoryClick = (category, index) => {
        setSelectedCategory(category);
        
        // Scroll the button into view
        const container = scrollContainerRef.current;
        const buttons = container.getElementsByTagName('button');
        const button = buttons[index];
        
        if (button) {
            const containerWidth = container.offsetWidth;
            const buttonWidth = button.offsetWidth;
            const scrollLeft = button.offsetLeft - (containerWidth / 2) + (buttonWidth / 2);
            
            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
            {/* Categories Navigation */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md shadow-sm z-10">
                <div className="px-2 py-3">
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto no-scrollbar gap-2"
                    >
                        {practiceCategories.map((category, index) => (
                            <Button
                                key={index}
                                variant={selectedCategory === category ? "default" : "ghost"}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5",
                                    selectedCategory === category && "bg-primary text-white"
                                )}
                                onClick={() => handleCategoryClick(category, index)}
                            >
                                <category.icon className="h-3.5 w-3.5" />
                                <span>{category.title}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-20">
                {/* Category Header */}
                <div className="my-4">
                    <div className="flex items-center gap-2">
                        <selectedCategory.icon className={`h-6 w-6 ${selectedCategory.color}`} />
                        <div>
                            <h1 className="text-lg font-bold">{selectedCategory.title}</h1>
                            <p className="text-sm text-gray-600">{selectedCategory.description}</p>
                        </div>
                    </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-3">
                    {selectedCategory.exercises.map((exercise, idx) => (
                        <Card 
                            key={idx} 
                            className="group active:scale-98 transition-transform"
                        >
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {exercise.name}
                                    </h3>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 px-3 text-white bg-primary"
                                    >
                                        Start
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-600">{exercise.description}</p>
                            </div>
                            <div className="h-0.5 w-full bg-gradient-to-r from-primary/20 to-primary/10" />
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Add this CSS to your global styles
const globalStyles = `
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

export default Practice; 