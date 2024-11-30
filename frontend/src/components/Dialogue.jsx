import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Mic, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak } from '@/utils/textToSpeech';

const Dialogue = ({ dialogue, isTeacher, isActive, isLatest }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Reset states when dialogue changes
    useEffect(() => {
        setIsPlaying(false);
        setHasRecorded(false);
        setIsRecording(false);
    }, [dialogue]);

    // Play audio when dialogue appears and is latest
    useEffect(() => {
        if (isLatest && dialogue.content) {
            handlePlay();
        }
    }, [dialogue, isLatest]);

    // Handle play/pause
    const handlePlay = async () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        try {
            setIsSpeaking(true);
            await speak(dialogue.content, {
                lang: 'en-US', // You might want to make this dynamic based on dialogue language
                rate: 0.9,     // Slightly slower for better clarity
                pitch: 1,
                volume: 1
            });
            setIsSpeaking(false);
        } catch (error) {
            console.error('Speech synthesis error:', error);
            setIsSpeaking(false);
        }
    };

    // Cancel speech when component unmounts or dialogue changes
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        };
    }, [dialogue]);

    // Animation variants
    const variants = {
        hidden: { 
            opacity: 0,
            y: 100,
            scale: 0.95
        },
        visible: { 
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.5
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <motion.div
            layout
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            className={`rounded-xl p-4 mb-4 ${
                isTeacher ? 'bg-blue-50' : 'bg-white border border-gray-200'
            } ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        delay: 0.2 
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                        ${isTeacher ? 'bg-blue-500' : 'bg-emerald-500'}`}
                >
                    {dialogue.speaker_name.charAt(0)}
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-between items-center mb-2"
                    >
                        <span className={`text-sm font-medium
                            ${isTeacher ? 'text-blue-700' : 'text-emerald-700'}`}>
                            {dialogue.speaker_name}
                        </span>
                        <div className="flex items-center gap-2">
                            {/* Audio Controls */}
                            <button 
                                onClick={handlePlay}
                                className={`p-2 rounded-full transition-colors
                                    ${isTeacher ? 'hover:bg-blue-100' : 'hover:bg-gray-100'}
                                    ${isSpeaking ? 'bg-primary/10 text-primary' : ''}`}
                                disabled={!isActive}
                            >
                                {isSpeaking ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            {/* {!isTeacher && (
                                <button 
                                    onClick={() => setIsRecording(!isRecording)}
                                    className={`p-2 rounded-full transition-colors
                                        ${isRecording ? 'bg-red-100 text-red-500' : 
                                        hasRecorded ? 'bg-green-100 text-green-500' : 
                                        'hover:bg-gray-100'}`}
                                    disabled={!isActive}
                                >
                                    {hasRecorded ? <Check size={16} /> : <Mic size={16} />}
                                </button>
                            )} */}
                        </div>
                    </motion.div>
                    
                    {/* Dialogue Text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-700 text-sm leading-relaxed mb-2"
                    >
                        {dialogue.content}
                    </motion.p>

                    {/* Practice Controls */}
                    {!isTeacher && isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-2 mt-3"
                        >
                            {/* <button 
                                className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
                            >
                                <RotateCcw size={12} />
                                Reset
                            </button> */}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Dialogue; 