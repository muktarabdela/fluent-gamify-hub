import React from 'react';
import { Play, Lock, CheckCircle } from 'lucide-react';

export default function LessonActionButton({ status, onClick }) {
    const buttonConfig = {
        completed: {
            text: 'Completed Lesson',
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

    return (
        <button
            onClick={status !== 'locked' ? onClick : undefined}
            className={`w-full ${className} text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300`}
            disabled={status === 'locked'}
        >
            <Icon size={16} className="mr-2" />
            {text}
        </button>
    );
}

