import { createOrUpdateUser } from '../api/userService';

export const getTelegramUser = () => {
    // Hardcoded user data for development
    const mockTelegramUser = {
        id: 12345678,  // Mock Telegram user ID
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        language_code: "en",
        auth_date: Math.floor(Date.now() / 1000)  // Current timestamp in seconds
    };

    // For development, always return the mock data
    return mockTelegramUser;

    /* Comment out the actual implementation for now
    if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        const user = webApp.initDataUnsafe?.user;
        if (user) {
            return {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                language_code: user.language_code,
            };
        }
    }
    return null;
    */
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
