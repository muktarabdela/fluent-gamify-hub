import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, RefreshCw, Volume2, Repeat } from 'lucide-react';
import { speak } from '@/utils/textToSpeech';
import { playCorrectSound, playWrongSound } from '@/utils/soundEffects';

const MultipleChoiceExercise = ({ exercise, onSubmit, onContinue }) => {
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(new Audio(exercise.audioUrl));

    useEffect(() => {
        setSelectedAnswer('');
        setSubmitted(false);
        setResult(null);
        setIsPlaying(false);
        audioRef.current = new Audio(exercise.audioUrl);
        
        playAudio();
    }, [exercise]);

    const playAudio = async (text = exercise.question) => {
        if (isPlaying) return;

        try {
            setIsPlaying(true);
            await speak(text);
        } catch (error) {
            console.error('Text-to-speech error:', error);
        } finally {
            setIsPlaying(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedAnswer) return;

        const isCorrect = selectedAnswer === exercise.correct_answer;
        let submitResult;

        try {
            setSubmitted(true);

            if (isCorrect) {
                submitResult = onSubmit(selectedAnswer);
                setResult({
                    isCorrect: true,
                    correctAnswer: exercise.correct_answer,
                    userAnswer: selectedAnswer,
                    showContinue: submitResult.showContinue
                });
                await playCorrectSound();
            } else {
                setResult({
                    isCorrect: false,
                    correctAnswer: exercise.correct_answer,
                    userAnswer: selectedAnswer,
                    showContinue: false
                });
                await playWrongSound();
            }
        } catch (error) {
            console.error('Error playing sound effect:', error);
            setResult({
                isCorrect,
                correctAnswer: exercise.correct_answer,
                userAnswer: selectedAnswer,
                showContinue: isCorrect ? submitResult?.showContinue : false
            });
        }
    };

    const handleReset = () => {
        setSelectedAnswer('');
        setSubmitted(false);
        setResult(null);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">{exercise.question}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => playAudio()}
                        className={`p-3 rounded-full ${isPlaying
                                ? 'bg-primary text-white'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                            } transition-all`}
                        disabled={isPlaying}
                    >
                        <Volume2 size={20} />
                    </button>
                    <button
                        onClick={() => playAudio()}
                        className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                        disabled={isPlaying}
                    >
                        <Repeat size={20} />
                    </button>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {exercise.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => !submitted && setSelectedAnswer(option)}
                        onDoubleClick={() => playAudio(option)}
                        className={`group relative w-full p-4 rounded-lg border-2 text-left transition-all ${selectedAnswer === option
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        disabled={submitted}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                    className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    Check Answer
                </button>
            ) : (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${result?.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        <p className="font-medium">
                            {result?.isCorrect ? 'Correct!' : 'Not quite right. Try again!'}
                        </p>
                        {!result?.isCorrect && (
                            <p className="text-sm mt-2">
                                Correct answer: <span className="font-medium">{result?.correctAnswer}</span>
                            </p>
                        )}
                    </div>

                    <button
                        onClick={result?.isCorrect ? onContinue : handleReset}
                        className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${result?.isCorrect
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                    >
                        {result?.isCorrect ? (
                            <>
                                Continue to next exercise
                                <ChevronRight size={20} />
                            </>
                        ) : (
                            <>
                                <RefreshCw size={18} />
                                Try Again
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MultipleChoiceExercise; 