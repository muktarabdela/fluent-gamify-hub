import React, { useState } from 'react';
import { BookOpen, Book, Bookmark, MessageSquareQuote, ChevronDown, ChevronUp } from 'lucide-react';

const QuickLesson = ({ quickLesson }) => {
    console.log('Quick lesson data:', quickLesson);
    const [expandedSections, setExpandedSections] = useState({
        grammar: false,
        vocabulary: false,
        phrases: false,
    });

    if (!quickLesson) return null;

    const grammarFocus = quickLesson.grammar_focus || [];
    const vocabularyWords = quickLesson.vocabulary_words || [];
    const vocabularyPhrases = quickLesson.vocabulary_phrases || [];

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const SectionHeader = ({ icon: Icon, title, section }) => (
        <div
            className="flex items-center justify-between cursor-pointer p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
            onClick={() => toggleSection(section)}
        >
            <div className="flex items-center space-x-3">
                <Icon size={20} className="text-indigo-600" />
                <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>
            {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
                <div className="bg-indigo-600 rounded-full p-3">
                    <BookOpen size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{quickLesson.title}</h2>
                    <p className="text-sm text-gray-600">Quick Introduction</p>
                </div>
            </div>

            <div className="prose prose-indigo mb-6">
                <p className="text-gray-700">{quickLesson.introduction}</p>
            </div>

            <div className="space-y-4">
                {grammarFocus.length > 0 && (
                    <div>
                        <SectionHeader 
                            icon={Book} 
                            title="Grammar Focus" 
                            section="grammar" 
                        />
                        {expandedSections.grammar && (
                            <div className="mt-2 space-y-4">
                                {grammarFocus.map((grammarPoint, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                                        <h4 className="text-indigo-600 font-medium mb-2">
                                            {grammarPoint.topic}
                                        </h4>
                                        <div className="space-y-2">
                                            {grammarPoint.examples.map((example, exIndex) => (
                                                <div key={exIndex} className="text-gray-700 pl-4">
                                                    • {example}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {vocabularyWords.length > 0 && (
                    <div>
                        <SectionHeader icon={Bookmark} title="Vocabulary" section="vocabulary" />
                        {expandedSections.vocabulary && (
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {vocabularyWords.map((word, index) => (
                                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                                        {typeof word === 'object' ? (
                                            <>
                                                <span className="font-semibold text-indigo-600">{word.word}</span>
                                                {word.definition && <span className="text-gray-600 ml-2">- {word.definition}</span>}
                                            </>
                                        ) : (
                                            <span className="font-medium text-gray-800">{word}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {vocabularyPhrases.length > 0 && (
                    <div>
                        <SectionHeader icon={MessageSquareQuote} title="Common Phrases" section="phrases" />
                        {expandedSections.phrases && (
                            <div className="mt-2 space-y-2">
                                {vocabularyPhrases.map((phrase, index) => (
                                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                                        {typeof phrase === 'object' ? (
                                            <>
                                                <span className="font-medium text-indigo-600">"{phrase.phrase}"</span>
                                                {phrase.description && <span className="text-gray-600 ml-2">- {phrase.description}</span>}
                                            </>
                                        ) : (
                                            <span className="font-medium text-gray-800">"{phrase}"</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickLesson;