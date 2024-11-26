import { createOrUpdateUser } from '../api/userService';

export const getTelegramUser = () => {
    if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;

        // Get user data
        const user = webApp.initDataUnsafe?.user;
        console.log("telegram use data", user)
        if (user) {
            return {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                language_code: user.language_code,
                // Add any other user properties you need
            };
        }
    }
    return null;
};

export const handleTelegramResponse = async (response) => {
    try {
        // Create or update user in the database
        const user = await createOrUpdateUser(response);
        return user;
    } catch (error) {
        console.error('Error handling Telegram response:', error);
        throw error;
    }
};
