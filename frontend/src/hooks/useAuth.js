import { useState, useEffect } from 'react';
import { getTelegramUser } from '@/utils/telegram';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const telegramUser = getTelegramUser();
        if (telegramUser) {
            setUser(telegramUser);
        }
        setLoading(false);
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user
    };
}; 