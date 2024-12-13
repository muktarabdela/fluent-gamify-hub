const { QuickLesson, Lesson } = require('../model/model'); // Import Mongoose models

const quickLessonController = {
    // Get quick lesson by lesson ID
    getQuickLessonByLessonId: async (req, res) => {
        try {
            // Log the lessonId parameter for debugging
            console.log('Request lesson ID:', req.params.lessonId);

            // Ensure lesson_id is treated as a string for the query
            const lessonId = req.params.lessonId.toString();

            // Query the database using the lessonId
            const quickLessons = await QuickLesson.find({ lesson_id: lessonId }).lean();

            // If no quick lessons are found, return a 404
            if (quickLessons.length === 0) {
                return res.status(404).json({ message: 'Quick lesson not found' });
            }

            // Log the raw data for debugging
            // console.log('Raw quick lesson data:', quickLessons);

            // Return the quick lessons in the response
            res.json(quickLessons);
        } catch (error) {
            console.error('Error fetching quick lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new quick lesson
    createQuickLesson: async (req, res) => {
        console.log('Received request to create quick lesson:', req.body);
        const {
            lesson_id,
            title,
            introduction,
            grammar_focus,
            vocabulary_words,
            vocabulary_phrases,
            key_points,
            example_sentences,
            image_url
        } = req.body;

        // Validate required fields
        if (!lesson_id || !title || !introduction) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'lesson_id, title, and introduction are required'
            });
        }

        try {
            // Verify that the lesson exists
            const lesson = await Lesson.findById(lesson_id);

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            // Create the quick lesson
            const newQuickLesson = new QuickLesson({
                lesson_id,
                title,
                introduction,
                grammar_focus,
                vocabulary_words,
                vocabulary_phrases,
                key_points,
                example_sentences,
                image_url
            });

            await newQuickLesson.save();

            console.log('Created quick lesson:', newQuickLesson);
            res.status(201).json(newQuickLesson);
        } catch (error) {
            console.error('Error creating quick lesson:', error);
            res.status(500).json({
                message: 'Failed to create quick lesson',
                error: error.message
            });
        }
    },

    // Update quick lesson
    updateQuickLesson: async (req, res) => {
        const {
            title,
            introduction,
            grammar_focus,
            vocabulary_words,
            vocabulary_phrases,
            key_points,
            example_sentences,
            image_url
        } = req.body;

        try {
            const updatedQuickLesson = await QuickLesson.findByIdAndUpdate(req.params.id, {
                title,
                introduction,
                grammar_focus,
                vocabulary_words,
                vocabulary_phrases,
                key_points,
                example_sentences,
                image_url
            }, { new: true });

            if (!updatedQuickLesson) {
                return res.status(404).json({ message: 'Quick lesson not found' });
            }

            res.json({ message: 'Quick lesson updated successfully', quickLesson: updatedQuickLesson });
        } catch (error) {
            console.error('Error updating quick lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete quick lesson
    deleteQuickLesson: async (req, res) => {
        try {
            const deletedQuickLesson = await QuickLesson.findByIdAndDelete(req.params.id);

            if (!deletedQuickLesson) {
                return res.status(404).json({ message: 'Quick lesson not found' });
            }

            res.json({ message: 'Quick lesson deleted successfully' });
        } catch (error) {
            console.error('Error deleting quick lesson:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = quickLessonController; 