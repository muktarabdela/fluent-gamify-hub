import React, { useState } from 'react';
import SentenceBuildingExercise from './SentenceBuildingExercise';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import ShadowingExercise from './ShadowingExercise';
import FillBlankExercise from './FillBlankExercise';
import { Progress } from "@/components/ui/progress";
import { updateUserProgress } from '@/api/userService';

const ExerciseContainer = ({ exercises, userId, lessonId, onComplete }) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [completedExercises, setCompletedExercises] = useState(new Set());

    const currentExercise = exercises[currentExerciseIndex];
    const progress = (completedExercises.size / exercises.length) * 100;

    const handleExerciseSubmit = async (answer) => {
        // Mark the current exercise as completed immediately
        const newCompletedExercises = new Set([...completedExercises, currentExercise.exercise_id]);
        setCompletedExercises(newCompletedExercises);

        // Check if all exercises are completed
        if (newCompletedExercises.size === exercises.length) {
            try {
                await updateUserProgress(userId, {
                    lesson_id: lessonId,
                    status: 'completed',
                    score: 100
                });
                onComplete();
            } catch (error) {
                console.error('Error updating lesson progress:', error);
            }
        }

        return { 
            isCorrect: true, 
            showContinue: currentExerciseIndex < exercises.length - 1
        };
    };

    const handleContinue = () => {
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // If this was the last exercise, call onComplete
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
                <Progress value={progress} className="h-2" />
            </div>

            <span className="inline-block px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-4">
                {exercises[currentExerciseIndex].type.replace('_', ' ').toUpperCase()}
            </span>
            
            {/* Current exercise */}
            {renderExercise()}
        </div>
    );
};

export default ExerciseContainer; 