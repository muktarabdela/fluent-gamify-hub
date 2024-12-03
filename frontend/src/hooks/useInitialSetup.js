import { useState, useEffect } from 'react';
import { getTelegramUser, handleTelegramResponse } from '@/utils/telegram';
import { getUserById } from '@/api/userService';
import { toast } from 'sonner';

export const useInitialSetup = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                setLoading(true);
                const telegramUser = getTelegramUser();
                
                if (telegramUser) {
                    toast.info(`Telegram User Found: ${telegramUser.id}`);
                }

                if (!telegramUser?.id) {
                    toast.error("No Telegram user ID available");
                    setLoading(false);
                    return;
                }

                try {
                    const existingUser = await getUserById(telegramUser.id);
                    toast.success("Existing user found");
                    setUser(existingUser);

                    if (!existingUser.onboarding_completed) {
                        setShowWelcome(true);
                    }
                } catch (error) {
                    if (error.response?.status === 404) {
                        toast.info("Creating new user...");
                        const newUser = await handleTelegramResponse(telegramUser);
                        setUser(newUser);
                        setShowWelcome(true);
                        toast.success("New user created");
                    } else {
                        console.error('Error fetching user:', error);
                        toast.error(`Error fetching user: ${error.message}`);
                        throw error;
                    }
                }
            } catch (error) {
                console.error('Error in initial setup:', error);
                toast.error(`Failed to initialize user: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, []);

    return { loading, user, showWelcome, setShowWelcome };
}; 