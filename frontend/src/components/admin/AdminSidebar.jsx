import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    BookOpen, 
    Library, 
    FileText, 
    Edit3, 
    Dumbbell,
    Layout,
    Users,
    MessageCircle,
    Video
} from 'lucide-react';

const AdminSidebar = () => {
    const navItems = [
        { 
            path: '/admin', 
            icon: <Layout className="w-5 h-5" />, 
            label: 'Dashboard',
            exact: true 
        },
        { 
            path: '/admin/units', 
            icon: <Library className="w-5 h-5" />, 
            label: 'Units' 
        },
        { 
            path: '/admin/lessons', 
            icon: <BookOpen className="w-5 h-5" />, 
            label: 'Lessons' 
        },
        { 
            path: '/admin/quick-lessons', 
            icon: <FileText className="w-5 h-5" />, 
            label: 'Quick Lessons' 
        },
        { 
            path: '/admin/exercises', 
            icon: <Edit3 className="w-5 h-5" />, 
            label: 'Exercises' 
        },
        { 
            path: '/admin/practice', 
            icon: <Dumbbell className="w-5 h-5" />, 
            label: 'Practice Exercises' 
        },
        { 
            path: '/admin/users', 
            icon: <Users className="w-5 h-5" />, 
            label: 'Users' 
        },
        { 
            path: '/admin/telegram-groups', 
            icon: <MessageCircle className="w-5 h-5" />, 
            label: 'Telegram Groups' 
        },
        { 
            path: '/admin/live-sessions', 
            icon: <Video className="w-5 h-5" />, 
            label: 'Live Sessions' 
        }
    ];

    return (
        <div className="w-64 bg-white border-r shadow-sm">
            <div className="p-6">
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            </div>
            <nav className="mt-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-6 py-3 text-gray-700
                            hover:bg-gray-50 transition-colors
                            ${isActive ? 'bg-primary/10 text-primary font-medium' : ''}
                        `}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default AdminSidebar; 