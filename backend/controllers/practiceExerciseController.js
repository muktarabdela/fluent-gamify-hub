const { PracticeExercise, Topic, Category, ExerciseType } = require('../model/model'); // Import Mongoose models

const practiceExerciseController = {
    // Get topics
    getTopics: async (req, res) => {
        try {
            const topics = await Topic.find();
            res.json(topics);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get categories with exercise types
    getCategories: async (req, res) => {
        try {
            const categories = await Category.find().populate('exerciseTypes');
            res.json(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create exercise
    createExercise: async (req, res) => {
        try {
            const { type_id, topic_id, content } = req.body;

            // Validate required fields
            if (!type_id || !topic_id || !content) {
                return res.status(400).json({
                    message: 'type_id, topic_id, and content are required'
                });
            }

            // Validate content is an object
            if (typeof content !== 'object' || content === null) {
                return res.status(400).json({
                    message: 'Content must be a valid object'
                });
            }

            const newExercise = new PracticeExercise({
                type_id,
                topic_id,
                content
            });

            await newExercise.save();
            res.status(201).json({
                id: newExercise._id,
                message: 'Exercise created successfully'
            });
        } catch (error) {
            console.error('Error creating exercise:', error);
            res.status(500).json({ error: 'Failed to create exercise' });
        }
    },

    // Get exercises
    getExercises: async (req, res) => {
        try {
            const { categoryId, topicId } = req.query;

            if (!categoryId || !topicId) {
                return res.status(400).json({
                    message: 'categoryId and topicId are required query parameters'
                });
            }

            // Build dynamic query based on filters
            const exercises = await PracticeExercise.find({ topic_id: topicId })
                .populate('type_id', 'name')
                .populate('topic_id', 'name')
                .populate({
                    path: 'type_id',
                    populate: { path: 'category_id', model: 'Category' }
                });

            res.json(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            res.status(500).json({ message: 'Failed to fetch exercises' });
        }
    },

    // Get exercise by ID
    getExerciseById: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    message: 'Exercise ID is required'
                });
            }

            const exercise = await PracticeExercise.findById(id)
                .populate('type_id', 'name')
                .populate('topic_id', 'name');

            if (!exercise) {
                return res.status(404).json({
                    message: 'Exercise not found'
                });
            }

            res.json(exercise);
        } catch (error) {
            console.error('Error fetching exercise details:', error);
            res.status(500).json({ message: 'Failed to fetch exercise details' });
        }
    },
    // ########################################################
};

module.exports = practiceExerciseController; 