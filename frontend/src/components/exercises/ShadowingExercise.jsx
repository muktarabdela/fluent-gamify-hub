import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, StopCircle, ChevronRight, Volume2, Check, Turtle, RefreshCw } from 'lucide-react';
import { speak } from '@/utils/textToSpeech';
import { playCorrectSound, playWrongSound } from '@/utils/soundEffects';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const ShadowingExercise = ({ exercise, onSubmit, onContinue }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingSlow, setIsPlayingSlow] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [wordScores, setWordScores] = useState([]);
    const recognitionRef = useRef(null);
    const { 
        startRecording: startSpeechRecognition, 
        stopRecording: stopSpeechRecognition, 
        isProcessing,
        error: recognitionError 
    } = useSpeechRecognition();

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
            setIsRecording(true);
            const transcript = await startSpeechRecognition();
            
            if (transcript) {
                // Normalize the answers before comparison
                const userAnswer = normalizeText(transcript.toLowerCase());
                const correctAnswer = normalizeText(exercise.correct_answer.toLowerCase());
                
                console.log('Normalized user answer:', userAnswer);
                console.log('Normalized correct answer:', correctAnswer);
                
                const userWords = userAnswer.split(' ');
                const correctWords = correctAnswer.split(' ');
                const scores = correctWords.map((correctWord, index) => {
                    const userWord = userWords[index]?.toLowerCase();
                    console.log(`Comparing: "${userWord}" with "${correctWord}"`);
                    
                    if (!userWord) return false;
                    
                    // Check for number matches first
                    if (isNumberMatch(userWord, correctWord)) {
                        console.log('Number match found!');
                        return true;
                    }
                    
                    const similarity = calculateSimilarity(userWord, correctWord);
                    console.log(`Similarity score: ${similarity}`);
                    return similarity >= 0.7;
                });

                setWordScores(scores);
                const correctWordCount = scores.filter(Boolean).length;
                const isCorrect = correctWordCount >= Math.ceil(correctWords.length * 0.3);
                
                setSubmitted(true);
                if (isCorrect) {
                    const submitResult = await onSubmit(userAnswer);
                    setResult({
                        isCorrect: true,
                        userAnswer,
                        correctAnswer,
                        showContinue: submitResult?.showContinue
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
            }
        } catch (error) {
            console.error('Error in speech recognition:', error);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        try {
            await stopSpeechRecognition();
            setIsRecording(false);
        } catch (error) {
            console.error('Error stopping recording:', error);
            setIsRecording(false);
        }
    };

    // Add this helper function for better word comparison
    const calculateSimilarity = (str1, str2) => {
        if (str1 === str2) return 1.0;
        
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len1][len2]) / maxLen;
    };

    // Add these helper functions before the return statement
    const normalizeText = (text) => {
        return text
            .replace(/\./g, '') // Remove periods
            .replace(/'/g, '') // Remove apostrophes
            .replace(/im/g, 'i am') // Replace "im" or "i'm" with "i am"
            .replace(/\d+/g, (num) => numberToWords(parseInt(num))) // Convert numbers to words
            .trim();
    };

    const numberToWords = (num) => {
        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
            'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
            'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        if (num < 20) return ones[num];
        if (num < 100) {
            return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
        }
        return num.toString(); // Fall back to original number if too large
    };

    const isNumberMatch = (word1, word2) => {
        // Convert both words to numbers if possible
        const num1 = parseInt(word1);
        const num2 = parseInt(word2);
        
        if (!isNaN(num1) || !isNaN(num2)) {
            // If either is a number, convert both to words and compare
            const word1Normalized = !isNaN(num1) ? numberToWords(num1) : word1;
            const word2Normalized = !isNaN(num2) ? numberToWords(num2) : word2;
            return word1Normalized === word2Normalized;
        }
        return false;
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
                        className={`p-6 rounded-full text-white shadow-lg transform transition-all ${
                            isRecording
                                ? 'bg-red-500 hover:bg-red-600 scale-110'
                                : 'bg-primary hover:bg-primary/90'
                        } ${submitted || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={submitted || isProcessing}
                    >
                        {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
                    </button>
                    <p className="text-sm text-gray-500">
                        {isProcessing ? 'Processing...' : 'Tap to speak'}
                    </p>
                    {recognitionError && (
                        <p className="text-sm text-red-500">
                            Error: {recognitionError}
                        </p>
                    )}
                    {/* Add debug information */}
                    {import.meta.env.DEV && (
                        <div className="text-xs text-gray-500">
                            <p>Recording: {isRecording ? 'Yes' : 'No'}</p>
                            <p>Error: {recognitionError || 'None'}</p>
                        </div>
                    )}
                </div>

                {/* Feedback and Continue Section */}
                {submitted && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-lg ${wordScores.filter(Boolean).length >= 1 ? 'bg-green-100' : 'bg-red-100'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    wordScores.filter(Boolean).length >= 1 ? 'bg-green-500' : 'bg-red-500'
                                }`}>
                                    <Check className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className={`font-medium ${
                                        wordScores.filter(Boolean).length >= 1 ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                        {wordScores.filter(Boolean).length >= 1 ? 'Well done!' : 'Try again!'}
                                    </p>
                                    <p className={`text-sm ${
                                        wordScores.filter(Boolean).length >= 1 ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                        {wordScores.filter(Boolean).length} of {wordScores.length} words pronounced correctly
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={wordScores.filter(Boolean).length >= 1 ? onContinue : () => {
                                setSubmitted(false);
                                setIsRecording(false);
                                setResult(null);
                                setWordScores([]);
                            }}
                            className="w-full py-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-medium shadow-md"
                        >
                            {wordScores.filter(Boolean).length >= 1 ? (
                                <>
                                    Continue
                                    <ChevronRight size={20} />
                                </>
                            ) : (
                                <>
                                    Try Again
                                    <RefreshCw size={20} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShadowingExercise; 