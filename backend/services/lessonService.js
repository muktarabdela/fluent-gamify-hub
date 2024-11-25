const { pool } = require('../config/db');
const openai = require('../config/openai');  // You'll need to configure OpenAI

class LessonService {
    // Start a new lesson
    async startLesson(userId, lessonId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get lesson details
            const [lesson] = await connection.query(
                'SELECT * FROM Lessons WHERE lesson_id = ?',
                [lessonId]
            );

            // Generate dialogue using OpenAI
            const dialogue = await this.generateDialogue(lesson[0].title);

            // Save dialogue
            const [dialogueResult] = await connection.query(
                'INSERT INTO Dialogues (lesson_id, content) VALUES (?, ?)',
                [lessonId, dialogue]
            );

            // Create user progress entry
            await connection.query(
                'INSERT INTO UserProgress (user_id, lesson_id, status) VALUES (?, ?, "started")',
                [userId, lessonId]
            );

            await connection.commit();
            return { lesson: lesson[0], dialogue };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Generate dialogue using OpenAI
    async generateDialogue(lessonTitle) {
        const prompt = `Create a natural dialogue about ${lessonTitle} in English. 
                       The dialogue should be between two people and include common expressions.`;
        
        const completion = await openai.createCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500
        });

        return completion.choices[0].message.content;
    }

    // Get exercises for a lesson
    async getExercises(lessonId) {
        const [exercises] = await pool.query(
            'SELECT * FROM Exercises WHERE lesson_id = ? ORDER BY order_number',
            [lessonId]
        );
        return exercises;
    }

    // Check exercise answer
    async checkAnswer(exerciseId, userAnswer) {
        const [exercise] = await pool.query(
            'SELECT * FROM Exercises WHERE exercise_id = ?',
            [exerciseId]
        );

        let isCorrect = false;
        switch (exercise[0].type) {
            case 'sentence_building':
                isCorrect = this.checkSentenceBuildingAnswer(exercise[0], userAnswer);
                break;
            case 'multiple_choice':
                isCorrect = exercise[0].correct_answer === userAnswer;
                break;
            // Add other exercise types
        }

        return { isCorrect, correctAnswer: exercise[0].correct_answer };
    }
}

module.exports = new LessonService(); 