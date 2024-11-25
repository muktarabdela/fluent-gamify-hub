import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, StopCircle, ChevronRight, Volume2, Check } from 'lucide-react';

const ShadowingExercise = ({ exercise, onSubmit, onContinue }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [wordScores, setWordScores] = useState([]);
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Reset states when exercise changes
    useEffect(() => {
        setIsPlaying(false);
        setIsRecording(false);
        setSubmitted(false);
        setResult(null);
        setWordScores([]);
    }, [exercise]);

    const handlePlayback = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = async () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        // Simulate word-by-word scoring (replace with actual speech recognition)
        const words = exercise.correct_answer.split(' ');
        const simulatedScores = words.map(() => Math.random() > 0.3); // Random scoring for demo
        setWordScores(simulatedScores);

        const audioBlob = new Blob(audioChunksRef.current);
        const submitResult = onSubmit(audioBlob);
        setResult(submitResult);
        setSubmitted(true);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            {/* Exercise Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">{exercise.question}</h3>
                <button
                    onClick={handlePlayback}
                    className={`p-3 rounded-full ${isPlaying
                            ? 'bg-primary text-white'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        } transition-all`}
                >
                    <Volume2 size={20} />
                </button>
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
                    <audio
                        ref={audioRef}
                        src={exercise.audio_url}
                        onEnded={() => setIsPlaying(false)}
                    />
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