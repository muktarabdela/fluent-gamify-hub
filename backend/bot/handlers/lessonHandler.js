const { bot } = require('../bot');
const lessonService = require('../../services/lessonService');

bot.command('startlesson', async (ctx) => {
    const lessonId = ctx.message.text.split(' ')[1];
    const userId = ctx.from.id;

    try {
        const lesson = await lessonService.startLesson(userId, lessonId);
        
        // Send dialogue
        await ctx.reply(lesson.dialogue);

        // Send first exercise
        const exercises = await lessonService.getExercises(lessonId);
        await sendExercise(ctx, exercises[0]);

    } catch (error) {
        ctx.reply('Sorry, there was an error starting the lesson.');
    }
});

function sendExercise(ctx, exercise) {
    switch (exercise.type) {
        case 'sentence_building':
            // Send words in random order for sentence building
            const words = JSON.parse(exercise.options);
            ctx.reply('Build the sentence:', {
                reply_markup: {
                    inline_keyboard: [
                        words.map(word => ({
                            text: word,
                            callback_data: `word_${word}`
                        }))
                    ]
                }
            });
            break;

        case 'multiple_choice':
            // Send multiple choice question
            const options = JSON.parse(exercise.options);
            const buttons = options.map(option => [{
                text: option,
                callback_data: `answer_${option}`
            }]);
            
            ctx.reply(exercise.question, {
                reply_markup: {
                    inline_keyboard: buttons
                }
            });
            break;

        case 'shadowing':
            // Send audio and recording button
            ctx.replyWithVoice(exercise.audio_url);
            ctx.reply('Record yourself saying the sentence', {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎤 Record', callback_data: 'record' }
                    ]]
                }
            });
            break;
    }
} 