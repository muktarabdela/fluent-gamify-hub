import React, { useState, useEffect } from 'react';
import { Play, Lock, CheckCircle, BookOpen, MessageCircle, Mic, Video, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getLessonById } from '@/api/lessonService';
import { getExercisesByLesson } from '@/api/exerciseService';
import { getTelegramUser } from '@/utils/telegram';

const exerciseTypeIcons = {
    'sentence_building': BookOpen,
    'multiple_choice': MessageCircle,
    'shadowing': Mic,
    'fill_blank': Video,
    'listening': Headphones
};

const exerciseTypeLabels = {
    'sentence_building': 'Sentence Building',
    'multiple_choice': 'Multiple Choice',
    'shadowing': 'Shadowing Practice',
    'fill_blank': 'Fill in the Blanks',
    'listening': 'Listening Practice'
};

export default function LessonActionButton({ status, lessonId, onClick }) {
    const telegramUser = getTelegramUser();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!lessonId) return;
            try {
                setLoading(true);
                const [lessonData, exercisesData] = await Promise.all([
                    getLessonById(lessonId),
                    getExercisesByLesson(lessonId, telegramUser?.id) // Replace with actual userId
                ]);
                setLesson(lessonData);
                setExercises(exercisesData);
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [lessonId]);

    // Group exercises by type
    const exercisesByType = exercises.reduce((acc, exercise) => {
        if (!acc[exercise.type]) {
            acc[exercise.type] = [];
        }
        acc[exercise.type].push(exercise);
        return acc;
    }, {});

    const buttonConfig = {
        completed: {
            text: 'Review Lesson',
            icon: CheckCircle,
            className: 'bg-green-500 hover:bg-green-600'
        },
        active: {
            text: 'Start Learning',
            icon: Play,
            className: 'bg-blue-500 hover:bg-blue-600'
        },
        locked: {
            text: 'Locked Lesson',
            icon: Lock,
            className: 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed'
        }
    };

    const { text, icon: Icon, className } = buttonConfig[status];

    const handleStartLesson = () => {
        console.log('Navigating to lesson:', lessonId);
        if (!lessonId) {
            console.error('No lesson ID provided to button');
            return;
        }
        navigate(`/lesson/${lessonId}`);
    };

    if (status === 'locked') {
        return (
            <button
                className={`w-full ${buttonConfig.locked.className} text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300`}
                disabled
            >
                <Lock size={16} className="mr-2" />
                {buttonConfig.locked.text}
            </button>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className={`w-full ${className} text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300`}
                >
                    <Icon size={16} className="mr-2" />
                    {text}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {lesson?.title || 'Loading...'}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-4 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        {/* Description */}
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {lesson?.description}
                            </p>
                        </div>

                        {/* Dialogue Practice */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <MessageCircle size={20} className="text-blue-600" />
                                <h4 className="text-sm font-semibold text-blue-900">
                                    Conversation Practice
                                </h4>
                            </div>
                            <p className="text-sm text-blue-700">
                                Practice real-world conversations with interactive dialogues
                            </p>
                        </div>


                        {/* Interactive Exercises */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Interactive Exercises</h4>
                            <div className="grid gap-3">
                                {Object.entries(exercisesByType).map(([type, exercisesOfType]) => {
                                    const Icon = exerciseTypeIcons[type] || BookOpen;
                                    return (
                                        <div
                                            key={type}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Icon size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium">
                                                    {exerciseTypeLabels[type]}
                                                </h5>
                                                <p className="text-xs text-gray-500">
                                                    {exercisesOfType.length} {exercisesOfType.length === 1 ? 'exercise' : 'exercises'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>


                        {/* Start Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleStartLesson}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md transition-colors"
                            >
                                Start Now
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

