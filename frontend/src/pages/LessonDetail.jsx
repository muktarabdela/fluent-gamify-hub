import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDialoguesByLesson } from '../api/dialogueService';
import { getLessonById } from '../api/lessonService';
import { getExercisesByLesson } from '../api/exerciseService';
import Dialogue from '../components/Dialogue';
import ExerciseContainer from '../components/exercises/ExerciseContainer';
import { ArrowLeft, MessageCircle, BookOpen, ChevronRight, AlertCircle, ListChecks } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getTelegramUser } from '@/utils/telegram';
import { updateUserProgress } from '../api/userService';
import { updateUserPreferences } from '../api/userService';
import { getQuickLessonByLessonId } from '../api/quickLessonService';
import QuickLesson from '../components/QuickLesson';

const LessonDetail = () => {
    const telegramUser = getTelegramUser();

    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [dialogues, setDialogues] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
    const [showExercises, setShowExercises] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const dialoguesContainerRef = useRef(null);
    const [quickLesson, setQuickLesson] = useState(null);

    // Add beforeunload event listener
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isComplete) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isComplete]);

    // Handle back navigation
    const handleBack = () => {
        if (!isComplete) {
            setShowExitDialog(true);
        } else {
            navigate(-1);
        }
    };

    useEffect(() => {
        const fetchLessonData = async () => {
            if (!lessonId) return;

            try {
                console.log('Fetching lesson data...');
                setLoading(true);

                const [lessonData, dialoguesData, exercisesData, quickLessonData] = await Promise.all([
                    getLessonById(lessonId),
                    getDialoguesByLesson(lessonId),
                    getExercisesByLesson(lessonId, telegramUser?.id),
                    getQuickLessonByLessonId(lessonId)
                ]);

                setLesson(lessonData);
                setDialogues(dialoguesData);
                setExercises(exercisesData);
                setQuickLesson(quickLessonData);
            } catch (err) {
                console.error('Error fetching lesson data:', err);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLessonData();
    }, [lessonId]);

    const handleContinue = () => {
        if (currentDialogueIndex < dialogues.length - 1) {
            setCurrentDialogueIndex(prev => prev + 1);
            setTimeout(() => {
                if (dialoguesContainerRef.current) {
                    const container = dialoguesContainerRef.current;
                    const scrollHeight = container.scrollHeight;
                    window.scrollTo({
                        top: scrollHeight - window.innerHeight + 200,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        } else {
            setShowExercises(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleExerciseComplete = async () => {
        try {
            // Mark lesson as completed
            await updateUserProgress(telegramUser?.id, {
                lesson_id: lessonId,
                status: 'completed',
                score: 100
            });

            // Award LIKE coins (10 per lesson completion)
            await updateUserPreferences(telegramUser?.id, {
                like_coins_increment: 10
            });

            setIsComplete(true);
        } catch (error) {
            console.error('Error updating lesson progress:', error);
        }
    };

    const ExitConfirmationDialog = () => (
        <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-yellow-600">
                        <AlertCircle className="h-5 w-5" />
                        Leave Lesson?
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2 space-y-2">
                        <p>You haven't completed this lesson yet. Your progress will be lost if you leave now.</p>
                        <p className="font-medium text-yellow-600">Are you sure you want to exit?</p>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-0">
                    <button
                        onClick={() => setShowExitDialog(false)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Continue Learning
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        Exit Lesson
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-red-500 text-center">
                    <p className="text-lg font-semibold mb-2">Oops!</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#243642]">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
                <div className="flex items-center p-4 max-w-lg mx-auto">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="ml-4 flex-1">
                        <h1 className="text-lg font-semibold text-gray-900">{lesson?.title}</h1>
                        <p className="text-sm text-gray-500">
                            {showExercises ? 'Practice Exercises' : 'Dialogue Practice'}
                        </p>
                    </div>
                    {!showExercises && (
                        <div className="text-sm font-medium text-gray-500">
                            {currentDialogueIndex + 1}/{dialogues.length}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div
                ref={dialoguesContainerRef}
                className="pt-20 pb-32 px-4 max-w-lg mx-auto relative overflow-y-auto"
            >
                {!showExercises && (
                    <>
                        {/* Lesson Info Card */}
                        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <MessageCircle size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Conversation Practice</h2>
                                    <p className="text-sm text-gray-500">{dialogues.length} exchanges</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">{lesson?.description}</p>
                        </div>

                        {/* Quick Lesson - Now displayed first */}
                        {quickLesson && <QuickLesson quickLesson={quickLesson} />}

                        {/* Dialogues */}
                        <div className="space-y-4 relative">
                            {dialogues.slice(0, currentDialogueIndex + 1).map((dialogue, index) => (
                                <Dialogue
                                    key={`${dialogue.dialogue_id}-${index}`}
                                    dialogue={dialogue}
                                    isTeacher={dialogue.speaker_role === 'Teacher'}
                                    isActive={index === currentDialogueIndex}
                                    isLatest={index === currentDialogueIndex}
                                />
                            ))}
                        </div>
                    </>
                )}

                {showExercises ? (
                    <>
                        {/* Exercise Info Card */}
                        {/* <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <BookOpen size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Practice Exercises</h2>
                                    <p className="text-sm text-gray-500">{exercises.length} exercises</p>
                                </div>
                            </div>
                        </div> */}

                        {/* Exercises */}
                        <ExerciseContainer
                            exercises={exercises}
                            userId={telegramUser?.id}
                            lessonId={lessonId}
                            onComplete={handleExerciseComplete}
                        />
                    </>
                ) : (
                    <>
                        {/* Show Quick Lesson after all dialogues are complete */}
                        {currentDialogueIndex === dialogues.length - 1 && (
                            <QuickLesson quickLesson={quickLesson} />
                        )}
                    </>
                )}
            </div>

            {/* Fixed Bottom Continue Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
                <div className="max-w-lg mx-auto">
                    {!showExercises && (
                        <button
                            onClick={handleContinue}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            {currentDialogueIndex === dialogues.length - 1 ? 'Start Exercises' : 'Continue'}
                            <ChevronRight size={20} />
                        </button>
                    )}
                    {showExercises && isComplete && (
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            Complete Lesson
                        </button>
                    )}
                </div>
            </div>

            {/* Exit Dialog */}
            <ExitConfirmationDialog />
        </div>
    );
};

export default LessonDetail;