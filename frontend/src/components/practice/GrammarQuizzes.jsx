import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from '../ui/button';

const GrammarQuizzes = ({ exercise }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);

    const content = typeof exercise.content === 'string' 
        ? JSON.parse(exercise.content) 
        : exercise.content;

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
        if (answer === content.questions[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setCurrentQuestion(currentQuestion + 1);
    };

    if (!content.questions || content.questions.length === 0) {
        return <div>No questions available</div>;
    }

    const question = content.questions[currentQuestion];

    return (
        <Card className="p-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">
                    Question {currentQuestion + 1} of {content.questions.length}
                </h3>
                <p className="text-gray-700">{question.question}</p>
            </div>

            <div className="space-y-2">
                {question.options.map((option, index) => (
                    <Button
                        key={index}
                        variant={selectedAnswer === option ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null}
                    >
                        {option}
                    </Button>
                ))}
            </div>

            {selectedAnswer && currentQuestion < content.questions.length - 1 && (
                <Button
                    className="mt-4 w-full"
                    onClick={handleNextQuestion}
                >
                    Next Question
                </Button>
            )}

            {selectedAnswer && currentQuestion === content.questions.length - 1 && (
                <div className="mt-4 text-center">
                    <h4 className="text-xl font-bold">Quiz Complete!</h4>
                    <p className="text-gray-600">
                        Your score: {score} out of {content.questions.length}
                    </p>
                </div>
            )}
        </Card>
    );
};

export default GrammarQuizzes;