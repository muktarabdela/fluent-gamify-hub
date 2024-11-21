import React from 'react';
import { Lock, Unlock, Headphones, BookOpen, Video, Mic, Users, CheckCircle } from 'lucide-react';
import LessonActionButton from './StartLearningButton';

// Dummy Data
const lessonsData = [
    {
        id: 1,
        title: "Ordering Food at a Restaurant",
        isLocked: false,
        situation: "Learn how to order food in a casual dining setting.",
        practices: ["Shadowing", "Flashcards", "Video Questions"],
        liveSession: {
            title: "Practice Ordering in a Virtual Restaurant",
            participants: 4,
            duration: "30 minutes"
        },
        status: 'completed'
    },
    {
        id: 2,
        title: "Booking a Hotel Room",
        isLocked: false,
        situation: "Learn phrases and tips for booking accommodations.",
        practices: ["Vocabulary Practice", "Listening Activity"],
        liveSession: {
            title: "Role-play Hotel Booking Scenarios",
            participants: 3,
            duration: "45 minutes"
        },
        status: 'active'
    },
    {
        id: 3,
        title: "Introducing Yourself",
        isLocked: true,
        situation: "Basic phrases to introduce yourself confidently.",
        practices: ["Shadowing", "Flashcards"],
        liveSession: {
            title: "Group Introduction Practice",
            participants: 5,
            duration: "20 minutes"
        },
        status: 'locked'
    },
    {
        id: 4,
        title: "Shopping for Groceries",
        isLocked: true,
        situation: "Understand common phrases for grocery shopping.",
        practices: ["Listening Practice", "Flashcards", "Video Questions"],
        liveSession: {
            title: "Virtual Grocery Shopping Experience",
            participants: 4,
            duration: "40 minutes"
        },
        status: 'locked'
    },
    {
        id: 5,
        title: "Taking Public Transportation",
        isLocked: true,
        situation: "Learn how to navigate public transport effectively.",
        practices: ["Shadowing", "Flashcards"],
        liveSession: {
            title: "Simulated Public Transport Journey",
            participants: 3,
            duration: "35 minutes"
        },
        status: 'locked'
    },
    {
        id: 6,
        title: "Attending a Meeting",
        isLocked: true,
        situation: "Key phrases for professional communication in meetings.",
        practices: ["Listening Activity", "Video Questions"],
        liveSession: {
            title: "Mock Business Meeting Roleplay",
            participants: 6,
            duration: "50 minutes"
        },
        status: 'locked'
    },
];

const practiceIcons = {
    "Shadowing": <Mic size={14} />,
    "Flashcards": <BookOpen size={14} />,
    "Video Questions": <Video size={14} />,
    "Vocabulary Practice": <BookOpen size={14} />,
    "Listening Activity": <Headphones size={14} />,
    "Listening Practice": <Headphones size={14} />,
};

function LessonCard({ lesson }) {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed':
                return 'border-2 border-green-500 bg-green-50';
            case 'active':
                return 'border-2 border-blue-500';
            default:
                return 'border-2 border-gray-300 bg-gray-50';
        }
    };

    return (
        <div
            className={`
        bg-white rounded-lg shadow-md overflow-hidden mb-4 
        ${getStatusStyles(lesson.status)}
      `}
        >
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">{lesson.title}</h2>
                    {lesson.status === 'completed' ? (
                        <CheckCircle className="text-green-500" size={24} />
                    ) : lesson.isLocked ? (
                        <Lock className="text-gray-500" size={24} />
                    ) : (
                        <Unlock className="text-green-500" size={24} />
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{lesson.situation}</p>
                <div className="border-t pt-3">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Interactive Practices:</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                        {lesson.practices.map((practice, index) => (
                            <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                {practiceIcons[practice]}
                                <span className="ml-1 text-xs">{practice}</span>
                            </span>
                        ))}
                    </div>
                    <div className="bg-yellow-100 rounded-md p-3 mb-3">
                        <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                            <Users size={16} className="mr-1" />
                            Live Group Session
                        </h3>
                        <p className="text-xs text-yellow-800 mb-1">{lesson.liveSession.title}</p>
                        <div className="flex justify-between text-xs text-yellow-700">
                            <span>{lesson.liveSession.participants} participants</span>
                            <span>{lesson.liveSession.duration}</span>
                        </div>
                    </div>
                    <LessonActionButton
                        status={lesson.status}
                        onClick={() => console.log(`Action for: ${lesson.title}`)}
                    />
                </div>
            </div>
        </div>
    );
}

export default function MobileLessonDashboard() {
    return (
        <div className="bg-gray-100 min-h-screen py-6 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Language Learning</h1>
            <div className="space-y-4">
                {lessonsData.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                ))}
            </div>
        </div>
    );
}

