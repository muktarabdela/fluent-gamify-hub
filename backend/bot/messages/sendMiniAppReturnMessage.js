const sendMiniAppReturnMessage = async (telegram, chatId) => {
    try {
        const webAppUrl = 'https://fluent-gamify-hub.vercel.app';

        const miniAppMessage = `
🌟 See Your Amazing Progress!  

Want to:  
📈 Track your speaking journey  
🎯 Set new language goals  
🗣️ Join more fun sessions  
📊 See how far you've come?  

Click below to continue your English adventure! 🚀`;

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '📦 View Progress',
                            web_app: { url: webAppUrl } // Opens the mini app
                        }
                    ]
                ]
            }
        };

        await telegram.sendMessage(chatId, miniAppMessage, options);
    } catch (error) {
        console.error('Error sending mini app return message:', error);
        throw error;
    }
};

module.exports = {
    sendMiniAppReturnMessage
};
