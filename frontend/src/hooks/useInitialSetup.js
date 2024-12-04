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
                console.log("telegramUser", telegramUser);
                if (telegramUser) {
                    toast.info(`Telegram User Found: ${telegramUser.id}`);
                }

                if (!telegramUser?.id) {
                    toast.error("No Telegram user ID available");
                    setLoading(false);
                    return;
                }

                // First, try to get existing user
                try {
                    const existingUser = await getUserById(telegramUser.id);
                    console.log("existingUser", existingUser);
                    if (!existingUser) {
                        toast.error("User data not found");
                        setLoading(false);
                        return;
                    }

                    toast.success("Existing user found");
                    setUser(existingUser);

                    // If user exists but hasn't completed onboarding, show welcome screens
                    if (!existingUser.onboarding_completed) {
                        setShowWelcome(true);
                    }
                } catch (error) {
                    // If user doesn't exist, create new user
                    if (error.response?.status === 404) {
                        toast.info("Creating new user...");
                        const newUser = await handleTelegramResponse(telegramUser);
                        setUser(newUser);
                        setShowWelcome(true); // Show welcome screens for new users
                        toast.success("New user created");
                    } else {
                        toast.error(`Error: ${error.message}`);
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