import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Volume2, Turtle, ChevronRight } from 'lucide-react';
import { speak } from '@/utils/textToSpeech';
import { playCorrectSound, playWrongSound } from '@/utils/soundEffects';

const SentenceBuildingExercise = ({ exercise, onSubmit, onContinue }) => {
    const [selectedWords, setSelectedWords] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingSlow, setIsPlayingSlow] = useState(false);
    const audioRef = React.useRef(new Audio(exercise.audioUrl));

    // Shuffle function
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Initialize shuffled words and play audio
    useEffect(() => {
        setAvailableWords(shuffleArray(exercise.options));
        setSelectedWords([]);
        setSubmitted(false);
        setResult(null);
        
        // Auto-play the audio with a small delay
        const timer = setTimeout(() => {
            playAudio();
        }, 500); // 500ms delay to ensure smooth transition

        // Cleanup timer if component unmounts or exercise changes
        return () => clearTimeout(timer);
    }, [exercise]); // Changed from exercise.options to exercise to react to any exercise change

    const playAudio = async (text = exercise.correct_answer) => {
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

    const playSlowAudio = async (text = exercise.correct_answer) => {
        if (isPlayingSlow) return;

        try {
            setIsPlayingSlow(true);
            await speak(text, {
                rate: 0.5,
                pitch: 0.95,
                volume: 1
            });
        } catch (error) {
            console.error('Text-to-speech error:', error);
        } finally {
            setIsPlayingSlow(false);
        }
    };

    const handleWordClick = (word, index, isSelected) => {
        if (!isSelected) {
            // Add word to selected words
            setSelectedWords([...selectedWords, word]);
            // Remove word from available words
            setAvailableWords(availableWords.filter((_, i) => i !== index));
        } else {
            // Remove word from selected words
            setSelectedWords(selectedWords.filter((_, i) => i !== index));
            // Add word back to available words
            setAvailableWords([...availableWords, word]);
        }
    };

    const handleWordSpeak = (word) => {
        playAudio(word);
    };

    const handleSubmit = async () => {
        const userAnswer = selectedWords.join(' ');
        const isCorrect = userAnswer.toLowerCase() === exercise.correct_answer.toLowerCase();
        let submitResult;

        try {
            setSubmitted(true);

            if (isCorrect) {
                submitResult = onSubmit(userAnswer);
                // Set the result state before playing the sound
                setResult({
                    isCorrect: true,
                    correctAnswer: exercise.correct_answer,
                    userAnswer,
                    showContinue: submitResult.showContinue
                });
                await playCorrectSound();
            } else {
                // Set the result state before playing the sound
                setResult({
                    isCorrect: false,
                    correctAnswer: exercise.correct_answer,
                    userAnswer
                });
                await playWrongSound();
            }
        } catch (error) {
            console.error('Error playing sound effect:', error);
            // Set result even if sound fails
            setResult({
                isCorrect,
                correctAnswer: exercise.correct_answer,
                userAnswer,
                showContinue: isCorrect ? submitResult?.showContinue : false
            });
        }
    };

    const handleReset = () => {
        setSelectedWords([]);
        setAvailableWords(shuffleArray(exercise.options));
        setSubmitted(false);
        setResult(null);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            {/* Question Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {exercise.question}
                    </h3>
                    <div className="flex gap-2">
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => playAudio()}
                                className={`p-3 rounded-full ${isPlaying
                                    ? 'bg-primary text-white'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                    } transition-all group relative`}
                                disabled={isPlaying || isPlayingSlow}
                            >
                                <Volume2 size={20} />
                            </button>
                            <button
                                onClick={() => playSlowAudio()}
                                className={`p-3 rounded-full ${isPlayingSlow
                                    ? 'bg-primary text-white'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                    } transition-all group relative`}
                                disabled={isPlaying || isPlayingSlow}
                            >
                                <Turtle size={20} />
                            </button>
                        </div>
                    </div>
                </div>
                <p className="text-gray-500 text-sm">
                    Listen to the audio and arrange the words to form the correct sentence
                </p>
            </div>

            {/* Selected Words Area */}
            <div className="mb-6 min-h-[60px] p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="flex flex-wrap gap-2">
                    {selectedWords.map((word, index) => (
                        <motion.div
                            key={`selected-${word}-${index}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="group relative px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm cursor-pointer flex items-center gap-2"
                        >
                            <span>
                                {word}
                            </span>
                            <div
                                className="absolute inset-0 cursor-grab"
                                onClick={() => handleWordClick(word, index, true)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Available Words */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    {availableWords.map((word, index) => (
                        <motion.div
                           
                            key={`available-${word}-${index}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="group relative px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium text-sm cursor-pointer transition-all flex items-center gap-2"
                        >
                            <span>
                                {word}
                            </span>
                            {/* <Volume2
                                size={14}
                                className="opacity-50 hover:opacity-100"
                                onClick={() => handleWordSpeak(word)}
                            /> */}
                            <div
                                className="absolute inset-0 cursor-grab"
                                onClick={() => handleWordClick(word, index, false)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Result Section */}
            <AnimatePresence>
                {submitted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`p-4 rounded-lg mb-4 ${result?.isCorrect
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {result?.isCorrect ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (
                                <X className="w-5 h-5 text-red-500" />
                            )}
                            <p className="font-medium text-gray-800">
                                {result?.isCorrect ? 'Excellent work!' : 'Not quite right'}
                            </p>
                        </div>
                        {!result?.isCorrect && (
                            <p className="text-sm text-gray-600 ml-7">
                                Correct answer: <span className="font-medium">{result?.correctAnswer}</span>
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3">
                {submitted && (
                    <button
                        onClick={result?.isCorrect ? onContinue : handleReset}
                        className={`flex-1 flex items-center justify-center gap-2 ${result?.isCorrect
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            } font-medium py-3 px-6 rounded-lg transition-colors`}
                    >
                        {result?.isCorrect ? (
                            <>
                                Continue
                                <ChevronRight size={18} />
                            </>
                        ) : (
                            <>
                                <RefreshCw size={18} />
                                Try Again
                            </>
                        )}
                    </button>
                )}
                {!submitted && (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedWords.length === 0}
                        className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Check Answer
                    </button>
                )}
            </div>
        </div>
    );
};

export default SentenceBuildingExercise; 