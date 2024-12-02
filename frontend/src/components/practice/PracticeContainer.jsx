import React from 'react';
import GrammarQuizzes from './GrammarQuizzes';
import SentenceBuilding from './SentenceBuilding';
import WordPronunciation from './WordPronunciation';
import DictationPractice from './DictationPractice';
import VideoStories from './VideoStories';
import SentenceShadowing from './SentenceShadowing';
import Flashcards from './Flashcards';

const PracticeContainer = ({ exercise }) => {
    if (!exercise) return null;

    const ExerciseComponents = {
        'Grammar Quiz': GrammarQuizzes,
        'Sentence Building': SentenceBuilding,
        'Word Pronunciation': WordPronunciation,
        'Dictation Practice': DictationPractice,
        'Video Stories': VideoStories,
        'Sentence Shadowing': SentenceShadowing,
        'Flashcards': Flashcards
    };

    const ExerciseComponent = ExerciseComponents[exercise.type_name];

    if (!ExerciseComponent) {
        return <div>Unsupported exercise type</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{exercise.type_name}</h2>
                <div className="flex gap-2 text-sm text-gray-600 mt-1">
                    <span>{exercise.topic_name}</span>
                    <span>•</span>
                    <span className="capitalize">{exercise.level}</span>
                </div>
            </div>
            <ExerciseComponent exercise={exercise} />
        </div>
    );
};

export default PracticeContainer;