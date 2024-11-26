import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, StopCircle, ChevronRight, Volume2, Check, Turtle } from 'lucide-react';
import { speak } from '@/utils/textToSpeech';
import { playCorrectSound, playWrongSound } from '@/utils/soundEffects';

const ShadowingExercise = ({ exercise, onSubmit, onContinue }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingSlow, setIsPlayingSlow] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [wordScores, setWordScores] = useState([]);
    const recognitionRef = useRef(null);

    // Remove any audio references that aren't being used
    useEffect(() => {
        // Cleanup function
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Reset states when exercise changes
    useEffect(() => {
        setIsPlaying(false);
        setIsPlayingSlow(false);
        setIsRecording(false);
        setSubmitted(false);
        setResult(null);
        setWordScores([]);
        
        // Stop any ongoing recognition when exercise changes
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        // Automatically play audio when new exercise loads
        playAudio();
    }, [exercise]);

    const playAudio = async () => {
        if (isPlaying) return;

        try {
            setIsPlaying(true);
            await speak(exercise.correct_answer);
        } catch (error) {
            console.error('Text-to-speech error:', error);
        } finally {
            setIsPlaying(false);
        }
    };

    const playSlowAudio = async () => {
        if (isPlayingSlow) return;

        try {
            setIsPlayingSlow(true);
            await speak(exercise.correct_answer, {
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

    const startRecording = async () => {
        try {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = async (event) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                const isFinal = event.results[current].isFinal;
                
                console.log('Speech detected:', {
                    transcript,
                    isFinal,
                    confidence: event.results[current][0].confidence
                });

                if (isFinal) {
                    const userAnswer = transcript.toLowerCase();
                    const correctAnswer = exercise.correct_answer.toLowerCase();
                    
                    console.log('Final comparison:', {
                        userSaid: userAnswer,
                        correctAnswer: correctAnswer,
                        isMatch: userAnswer === correctAnswer
                    });

                    // Compare words and generate scores
                    const userWords = userAnswer.split(' ');
                    const correctWords = correctAnswer.split(' ');
                    const scores = correctWords.map((word, index) => {
                        const match = userWords[index]?.toLowerCase() === word.toLowerCase();
                        console.log(`Word ${index}:`, {
                            expected: word,
                            heard: userWords[index] || 'missing',
                            match
                        });
                        return match;
                    });

                    setWordScores(scores);
                    const isCorrect = userAnswer === correctAnswer;

                    try {
                        setSubmitted(true);
                        if (isCorrect) {
                            const submitResult = onSubmit(userAnswer);
                            setResult({
                                isCorrect: true,
                                userAnswer,
                                correctAnswer,
                                showContinue: submitResult.showContinue
                            });
                            await playCorrectSound();
                        } else {
                            setResult({
                                isCorrect: false,
                                userAnswer,
                                correctAnswer
                            });
                            await playWrongSound();
                        }
                    } catch (error) {
                        console.error('Error handling submission:', error);
                    }
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech Recognition Error:', event.error);
            };

            recognitionRef.current.onstart = () => {
                console.log('Speech recognition started');
            };

            recognitionRef.current.onend = () => {
                console.log('Speech recognition ended');
            };

            recognitionRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting speech recognition:', error);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            {/* Exercise Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">{exercise.question}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={playAudio}
                        disabled={isPlaying || isPlayingSlow}
                        className={`p-3 rounded-full ${isPlaying
                            ? 'bg-primary text-white'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        } transition-all`}
                    >
                        <Volume2 size={20} />
                    </button>
                    <button
                        onClick={playSlowAudio}
                        disabled={isPlaying || isPlayingSlow}
                        className={`p-3 rounded-full ${isPlayingSlow
                            ? 'bg-primary text-white'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        } transition-all`}
                    >
                        <Turtle size={20} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Sentence Display */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {exercise?.correct_answer.split(' ').map((word, index) => (
                            <span
                                key={index}
                                className={`text-lg font-medium px-2 py-1 rounded ${submitted
                                        ? wordScores[index]
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {word}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recording Controls */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-6 rounded-full text-white shadow-lg transform transition-all ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 scale-110'
                                : 'bg-primary hover:bg-primary/90'
                            } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={submitted}
                    >
                        {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
                    </button>
                    <p className="text-sm text-gray-500">
                        {isRecording ? 'Tap to stop' : 'Tap to speak'}
                    </p>
                </div>

                {/* Feedback and Continue Section */}
                {submitted && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-green-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-green-800">Well done!</p>
                                    <p className="text-sm text-green-700">
                                        {wordScores.filter(Boolean).length} of {wordScores.length} words pronounced correctly
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onContinue}
                            className="w-full py-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-medium shadow-md"
                        >
                            Continue
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShadowingExercise; 