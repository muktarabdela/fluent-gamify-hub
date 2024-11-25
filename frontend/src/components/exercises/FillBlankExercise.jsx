import React, { useState, useEffect } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';

const FillBlankExercise = ({ exercise, onSubmit, onContinue }) => {
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    // Reset states when exercise changes
    useEffect(() => {
        setAnswer('');
        setSubmitted(false);
        setResult(null);
    }, [exercise]);

    const handleSubmit = () => {
        if (!answer.trim()) return;
        
        const isCorrect = answer.toLowerCase() === exercise.correct_answer.toLowerCase();
        const submitResult = isCorrect ? onSubmit(answer) : null;
        
        setResult({
            isCorrect,
            correctAnswer: exercise.correct_answer,
            userAnswer: answer,
            showContinue: isCorrect ? submitResult.showContinue : false
        });
        
        setSubmitted(true);
    };

    const handleReset = () => {
        setAnswer('');
        setSubmitted(false);
        setResult(null);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
                {exercise.question.split('___').map((part, index, array) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < array.length - 1 && (
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                disabled={submitted}
                                className="mx-2 px-3 py-1 border-b-2 border-primary focus:outline-none w-32 text-center"
                                placeholder="Type here"
                            />
                        )}
                    </React.Fragment>
                ))}
            </h3>

            {exercise.options && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {exercise.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => !submitted && setAnswer(option)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${
                                answer === option 
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            disabled={submitted}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
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
                        className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            result?.isCorrect 
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

export default FillBlankExercise; 