import React from 'react';
import { Play, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LessonActionButton({ status, lessonId, onClick }) {
    const navigate = useNavigate();

    const buttonConfig = {
        completed: {
            text: 'Review Lesson',
            icon: CheckCircle,
            className: 'bg-green-500 hover:bg-green-600'
        },
        active: {
            text: 'Start Learning',
            icon: Play,
            className: 'bg-blue-500 hover:bg-blue-600'
        },
        locked: {
            text: 'Locked Lesson',
            icon: Lock,
            className: 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed'
        }
    };

    const { text, icon: Icon, className } = buttonConfig[status];

    const handleClick = () => {
        if (status !== 'locked') {
            navigate(`/lesson/${lessonId}`);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full ${className} text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300`}
            disabled={status === 'locked'}
        >
            <Icon size={16} className="mr-2" />
            {text}
        </button>
    );
}

