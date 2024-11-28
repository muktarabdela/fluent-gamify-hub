import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Trophy, Heart, ChevronRight, Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const LessonCompletionDialog = ({ isOpen, onClose, likeCoins, nextLesson, currentStreak }) => {
    const navigate = useNavigate();
    // Trigger confetti when dialog opens
    React.useEffect(() => {
        if (isOpen) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <AnimatePresence>
                    {isOpen && (
                        <div className="text-center space-y-6 py-4">
                            {/* Trophy Animation */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="flex justify-center"
                            >
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Trophy className="w-10 h-10 text-yellow-500" />
                                </div>
                            </motion.div>

                            {/* Congratulations Text */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Fantastic Job! 🎉
                                </h2>
                                <p className="text-gray-600">
                                    You've completed this lesson successfully!
                                </p>
                            </motion.div>

                            {/* Rewards Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-gray-50 p-4 rounded-xl space-y-3"
                            >
                                {/* LIKE Coins */}
                                <div className="flex items-center justify-center gap-2 text-pink-500">
                                    <Heart className="w-5 h-5 fill-current" />
                                    <span className="font-semibold">+{likeCoins} LIKE coins earned!</span>
                                </div>

                                {/* Streak */}
                                {currentStreak > 0 && (
                                    <div className="flex items-center justify-center gap-2 text-orange-500">
                                        <Flame className="w-5 h-5" />
                                        <span className="font-semibold">{currentStreak} day streak! Keep it up! 🔥</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Next Lesson Preview */}
                            {nextLesson && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="bg-primary/5 p-4 rounded-xl space-y-2"
                                >
                                    <div className="flex items-center justify-center gap-2 text-primary">
                                        <Sparkles className="w-5 h-5" />
                                        <span className="font-semibold">Next Adventure Awaits!</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {nextLesson.title} is now unlocked!
                                    </p>
                                </motion.div>
                            )}

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="flex flex-col gap-3 pt-4"
                            >
                                <button
                                    onClick={() => navigate('/live-session', { state: { fromLesson: true } })}
                                    className="w-full px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    Practice in Live Session
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                {nextLesson && (
                                    <button
                                        onClick={() => navigate(`/live-session`)}
                                        className="w-full px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Next Lesson
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back to Home
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

export default LessonCompletionDialog; 