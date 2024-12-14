import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SentenceBuildingExercise from './SentenceBuildingExercise';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import ShadowingExercise from './ShadowingExercise';
import FillBlankExercise from './FillBlankExercise';
import { Progress } from "@/components/ui/progress";
import { getUserById, updateUserProgress, updateUserStreak, getUserStreak } from '@/api/userService';
import { getLessonById, updateLessonStatus } from '@/api/lessonService';
import LessonCompletionDialog from '../dialogs/LessonCompletionDialog';

const ExerciseContainer = ({ exercises, userId, lessonId, onComplete }) => {
    const navigate = useNavigate();
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [completedExercises, setCompletedExercises] = useState(new Set());
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [completionData, setCompletionData] = useState(null);
    const [exerciseScores, setExerciseScores] = useState(new Map());
    const [startTime] = useState(Date.now());
    const [streakData, setStreakData] = useState(null);

    const currentExercise = exercises[currentExerciseIndex];
    const progress = (completedExercises?.size / exercises.length) * 100;

    // Calculate overall score from all completed exercises
    const calculateOverallScore = () => {
        let totalScore = 0;
        let completedCount = 0;
        exerciseScores.forEach(score => {
            totalScore += score;
            completedCount++;
        });
        return completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
    };

    // Calculate total time spent on exercises
    const calculateTotalTime = () => {
        return Math.floor((Date.now() - startTime) / 1000);
    };

    const handleExerciseSubmit = async (answer) => {
        const newCompletedExercises = new Set([...completedExercises, currentExercise._id]);
        setCompletedExercises(newCompletedExercises);

        setExerciseScores(prev => new Map(prev.set(currentExercise._id, answer.score || 100)));

        try {
            if (newCompletedExercises.size === exercises.length) {
                // Get current streak data before update
                const currentStreakData = await getUserStreak(userId);
                setStreakData(currentStreakData);

                // Update lesson status and user progress
                const [lessonStatusResponse, streakResponse] = await Promise.all([
                    updateLessonStatus(lessonId, 'completed', userId),
                    updateUserStreak(userId)
                ]);
                console.log("lessonStatusResponse", lessonStatusResponse)
                // Get updated streak data after the update
                const updatedStreakData = await getUserStreak(userId);

                setCompletionData({
                    likeCoins: 10,
                    nextLesson: lessonStatusResponse.find(status => status.lesson_id !== parseInt(lessonId)),
                    currentStreak: updatedStreakData.current_streak,
                    isNewStreak: updatedStreakData.current_streak > (currentStreakData?.current_streak || 0)
                });

                setShowCompletionDialog(true);
                onComplete();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }

        return {
            isCorrect: true,
            showContinue: currentExerciseIndex < exercises?.length - 1
        };
    };

    const handleContinue = () => {
        if (currentExerciseIndex < exercises?.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            onComplete();
        }
    };

    const renderExercise = () => {
        const exercise = exercises[currentExerciseIndex];
        const commonProps = {
            exercise,
            onSubmit: handleExerciseSubmit,
            onContinue: handleContinue
        };

        switch (exercise.type) {
            case 'sentence_building':
                return <SentenceBuildingExercise {...commonProps} />;
            case 'multiple_choice':
                return <MultipleChoiceExercise {...commonProps} />;
            case 'shadowing':
                return <ShadowingExercise {...commonProps} />;
            case 'fill_blank':
                return <FillBlankExercise {...commonProps} />;
            default:
                return <div>Unsupported exercise type</div>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm mt-2">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{completedExercises.size} of {exercises.length} completed</span>
                </div>
                <Progress value={progress} className="h-2 bg-primary/20" />
            </div>

            <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-primary/40 rounded-full mb-4">
                {exercises[currentExerciseIndex].type.replace('_', ' ').toUpperCase()}
            </span>

            {/* Current exercise */}
            {renderExercise()}

            {/* Completion Dialog */}
            <LessonCompletionDialog
                isOpen={showCompletionDialog}
                onClose={() => setShowCompletionDialog(false)}
                likeCoins={completionData?.likeCoins}
                nextLesson={completionData?.nextLesson}
                currentStreak={completionData?.currentStreak}
                isNewStreak={completionData?.isNewStreak}
            />
        </div>
    );
};

export default ExerciseContainer; 