import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { ArrowLeft, BookOpen, MessageSquare, Video, Mic, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { lessonsData } from '@/components/Lessons';

const interactiveLessons = {
    1: [
        {
            type: 'video',
            title: 'Restaurant Dialogue Demonstration',
            duration: '5 mins',
            icon: Video
        },
        {
            type: 'practice',
            title: 'Menu Vocabulary Practice',
            duration: '10 mins',
            icon: BookOpen
        },
        {
            type: 'speaking',
            title: 'Order Practice with AI',
            duration: '10 mins',
            icon: Mic
        },
        {
            type: 'roleplay',
            title: 'Interactive Restaurant Scene',
            duration: '15 mins',
            icon: Users
        }
    ],
    // Add more lessons as needed
};

const DetailLesson = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const lesson = lessonsData.find(l => l.id === parseInt(id));

    // Handle page refresh warning
    useBeforeUnload((event) => {
        if (hasInteracted) {
            event.preventDefault();
            return (event.returnValue = "");
        }
    });

    // Handle back button and navigation
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasInteracted) {
                setShowWarning(true);
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const handlePopState = (e) => {
            if (hasInteracted) {
                e.preventDefault();
                setShowWarning(true);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasInteracted]);

    // Simulate user interaction
    const handleInteraction = () => {
        setHasInteracted(true);
    };

    const handleBack = () => {
        if (hasInteracted) {
            setShowWarning(true);
        } else {
            navigate(-1);
        }
    };

    const handleContinueLesson = () => {
        setShowWarning(false);
    };

    const handleDiscardProgress = () => {
        setShowWarning(false);
        navigate(-1);
    };

    if (!lesson) return <div>Lesson not found</div>;

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-4">
                <Button 
                    variant="ghost" 
                    className="mb-4"
                    onClick={handleBack}
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                </Button>

                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                        <p className="text-gray-600 mb-4">{lesson.situation}</p>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Grammar Focus</h2>
                                <div className="flex flex-wrap gap-2">
                                    {lesson.grammarFocus.map((point, index) => (
                                        <Badge key={index} variant="secondary">
                                            {point}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-3">Interactive Learning Path</h2>
                                <div className="space-y-3">
                                    {interactiveLessons[id]?.map((item, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                            onClick={handleInteraction}
                                        >
                                            <div className="bg-primary/10 p-2 rounded-full mr-4">
                                                <item.icon className="text-primary" size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium">{item.title}</h3>
                                                <p className="text-sm text-gray-500">{item.duration}</p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                Start
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-lg font-semibold mb-2">Live Session</h2>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h3 className="font-medium">{lesson.liveSession.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        {lesson.liveSession.participants} participants • {lesson.liveSession.duration}
                                    </p>
                                    <Button 
                                        className="mt-3" 
                                        variant="secondary"
                                        onClick={handleInteraction}
                                    >
                                        Join Session
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Sheet */}
            <Sheet open={showWarning} onOpenChange={setShowWarning}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Unsaved Progress</SheetTitle>
                        <SheetDescription>
                            You have unsaved progress in this lesson. What would you like to do?
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-3">
                        <Button 
                            className="w-full" 
                            variant="default"
                            onClick={handleContinueLesson}
                        >
                            Continue Lesson
                        </Button>
                        <Button 
                            className="w-full" 
                            variant="destructive"
                            onClick={handleDiscardProgress}
                        >
                            Discard Progress & Leave
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};

export default DetailLesson;