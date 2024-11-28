import React from 'react';
import { BookOpen, ListChecks, MessageSquareQuote } from 'lucide-react';

const QuickLesson = ({ quickLesson }) => {
    console.log('QuickLesson component received quickLesson:', quickLesson);
    if (!quickLesson) return null;

    const keyPoints = Array.isArray(quickLesson.key_points) 
        ? quickLesson.key_points 
        : [];
    
    const exampleSentences = Array.isArray(quickLesson.example_sentences) 
        ? quickLesson.example_sentences 
        : [];

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BookOpen size={24} className="text-primary" />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900">{quickLesson.title}</h2>
                    <p className="text-sm text-gray-500">Quick Introduction</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 mb-6">{quickLesson.content}</p>

                {/* Key Points */}
                {keyPoints.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 mb-3">
                            <ListChecks size={16} className="text-primary" />
                            Key Points
                        </h3>
                        <ul className="space-y-2">
                            {keyPoints.map((point, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Example Sentences */}
                {exampleSentences.length > 0 && (
                    <div className="bg-primary/5 rounded-lg p-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 mb-3">
                            <MessageSquareQuote size={16} className="text-primary" />
                            Example Sentences
                        </h3>
                        <ul className="space-y-2">
                            {exampleSentences.map((sentence, index) => (
                                <li key={index} className="text-sm text-gray-600 italic flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    "{sentence}"
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickLesson; 