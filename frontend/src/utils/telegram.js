import { createOrUpdateUser } from '../api/userService';

export const getTelegramUser = () => {
    if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        // Comment out Telegram validation for browser testing
        if (!webApp.initData) {
            console.error('Not running in Telegram WebApp');
            return null;
        }

        const user = webApp.initDataUnsafe?.user;
        if (user) {baseUrl
            // Include validation data
            return {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                language_code: user.language_code,
                auth_date: Math.floor(Date.now() / 1000),
                hash: webApp.initData.hash
            };
        }
    }
    
    // For development only
    // Modified to work in any environment
    return {
        id: 87654321,
        first_name: "muktar",
        last_name: "abdela",
        username: "muktar",
        language_code: "en",
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'development_hash'
    };
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

export const validateTelegramWebApp = () => {
    if (!window.Telegram?.WebApp) {
        throw new Error('This app must be opened from Telegram');
    }

    const webApp = window.Telegram.WebApp;
    
    // Verify platform
    if (!webApp.platform) {
        throw new Error('Invalid platform');
    }

    // Enable closing confirmation if needed
    webApp.enableClosingConfirmation();

    // Set header color
    webApp.setHeaderColor('#2481cc');

    return true;
};
