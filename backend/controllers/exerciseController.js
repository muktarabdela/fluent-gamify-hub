const { Exercise, UserProgress, Lesson } = require('../model/model'); // Import Mongoose models

const exerciseController = {
    // Get exercises by lesson
    getExercisesByLesson: async (req, res) => {
        try {
            const exercises = await Exercise.find({ lesson_id: req.params.lessonId }).sort({ order_number: 1 });
            res.json(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get exercise by ID
    getExerciseById: async (req, res) => {
        try {
            const exercise = await Exercise.findById(req.params.id);

            if (!exercise) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.json(exercise);
        } catch (error) {
            console.error('Error fetching exercise:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new exercise
    createExercise: async (req, res) => {
        const {
            lesson_id,
            type,
            question,
            correct_answer,
            options,
            audio_url,
            image_url,
            order_number
        } = req.body;

        // Validate required fields
        if (!lesson_id || !type || !question || !correct_answer || !order_number) {
            return res.status(400).json({
                message: 'lesson_id, type, question, correct_answer, and order_number are required'
            });
        }

        try {
            // Verify that the lesson exists
            const lesson = await Lesson.findById(lesson_id);

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            // Create the exercise
            const newExercise = new Exercise({
                lesson_id,
                type,
                question,
                correct_answer,
                options,
                audio_url,
                image_url,
                order_number
            });

            await newExercise.save();
            res.status(201).json(newExercise);
        } catch (error) {
            console.error('Error creating exercise:', error);
            res.status(500).json({
                message: 'Failed to create exercise',
                error: error.message
            });
        }
    },

    // Update exercise
    updateExercise: async (req, res) => {
        const {
            type,
            question,
            correct_answer,
            options,
            audio_url,
            image_url,
            order_number
        } = req.body;

        try {
            const updatedExercise = await Exercise.findByIdAndUpdate(req.params.id, {
                type,
                question,
                correct_answer,
                options,
                audio_url,
                image_url,
                order_number
            }, { new: true });

            if (!updatedExercise) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.json({ message: 'Exercise updated successfully', exercise: updatedExercise });
        } catch (error) {
            console.error('Error updating exercise:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete exercise
    deleteExercise: async (req, res) => {
        try {
            const deletedExercise = await Exercise.findByIdAndDelete(req.params.id);

            if (!deletedExercise) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.json({ message: 'Exercise deleted successfully' });
        } catch (error) {
            console.error('Error deleting exercise:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get exercises by lesson with user progress
    getExercisesByLessonWithProgress: async (req, res) => {
        try {
            const userId = req.query.userId;
            const exercises = await Exercise.find({ lesson_id: req.params.lessonId });

            const userProgress = await UserProgress.find({ user_id: userId, lesson_id: req.params.lessonId });

            const exercisesWithProgress = exercises.map(exercise => {
                const progress = userProgress.find(up => up.exercise_id.toString() === exercise._id.toString());
                return {
                    ...exercise.toObject(),
                    user_score: progress ? progress.score : 0,
                    progress_status: progress ? progress.status : 'not_started'
                };
            });

            res.json(exercisesWithProgress);
        } catch (error) {
            console.error('Error fetching exercises with progress:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Submit exercise answer
    submitExerciseAnswer: async (req, res) => {
        try {
            const { id: exerciseId } = req.params;
            const { userId, answer } = req.body;

            if (!userId || !answer) {
                return res.status(400).json({ message: 'userId and answer are required' });
            }

            // Get the exercise
            const exercise = await Exercise.findById(exerciseId);

            if (!exercise) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            // Validate answer based on exercise type
            let score = 0;
            let isCorrect = false;

            switch (exercise.type) {
                case 'sentence_building':
                case 'fill_blank':
                    isCorrect = answer.toLowerCase().trim() === exercise.correct_answer.toLowerCase().trim();
                    break;
                case 'multiple_choice':
                    isCorrect = answer === exercise.correct_answer;
                    break;
                case 'shadowing':
                    isCorrect = true; // For shadowing exercises, we assume completion equals success
                    break;
            }

            score = isCorrect ? 100 : 0;

            // Update or insert progress
            await UserProgress.findOneAndUpdate(
                { user_id: userId, lesson_id: exercise.lesson_id, exercise_id: exerciseId },
                { status: 'completed', score },
                { upsert: true, new: true }
            );

            res.json({
                isCorrect,
                score,
                correctAnswer: exercise.correct_answer
            });
        } catch (error) {
            console.error('Error submitting exercise answer:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create multiple exercises
    createMultipleExercises: async (req, res) => {
        const exercises = req.body.exercises;

        if (!Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({ message: 'Exercises array is required and must not be empty' });
        }

        try {
            const newExercises = await Exercise.insertMany(exercises);
            res.status(201).json(newExercises);
        } catch (error) {
            console.error('Error creating multiple exercises:', error);
            res.status(500).json({
                message: 'Failed to create exercises',
                error: error.message
            });
        }
    }
};

module.exports = exerciseController; 