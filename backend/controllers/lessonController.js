const { Lesson, Unit, UserProgress, LessonStatus } = require('../model/model'); // Import Mongoose models

// Helper function to initialize lesson statuses
const initializeLessonStatuses = async (unitId, userId) => {
    try {
        // Fetch all lessons in the unit
        const lessons = await Lesson.find({ unit_id: unitId });

        // Fetch existing lesson statuses for the user
        const existingStatuses = await LessonStatus.find({ unit_id: unitId, user_id: userId });

        // Create a set of existing lesson IDs for quick lookup
        const existingLessonIds = new Set(existingStatuses.map(status => status.lesson_id.toString()));

        // Filter lessons that do not have a status
        const lessonsWithoutStatus = lessons.filter(lesson => !existingLessonIds.has(lesson._id.toString()));

        if (lessonsWithoutStatus.length === 0) return;

        // Prepare new LessonStatus documents
        const statuses = lessonsWithoutStatus.map((lesson, index) => ({
            lesson_id: lesson._id,
            unit_id: unitId,
            user_id: userId,
            status: index === 0 ? 'active' : 'locked', // First lesson is 'active', rest are 'locked'
            created_at: new Date(),
            updated_at: new Date()
        }));

        // Insert new LessonStatus records
        await LessonStatus.insertMany(statuses).catch(err => console.error('Insert error:', err));

    } catch (error) {
        console.error('Error initializing lesson statuses:', error);
        throw error;
    }
};


const lessonController = {
    // Get all lessons for a specific unit
    getAllLessons: async (req, res) => {
        try {
            const { unitId } = req.query;
            const lessons = await Lesson.find({ unit_id: unitId }).populate('unit_id'); // Populate unit details if needed
            res.json(lessons);
        } catch (error) {
            console.error('Error fetching all lessons:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get lesson by ID
    getLessonById: async (req, res) => {
        try {
            const lesson = await Lesson.findById(req.params.id).populate('unit_id'); // Populate unit details if needed

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json(lesson);
        } catch (error) {
            console.error('Error fetching lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new lesson
    createLesson: async (req, res) => {
        const {
            title,
            description,
            order_number,
            grammar_focus,
            vocabulary_words,
            vocabulary_phrases,
            unit_id
        } = req.body;

        // Validate required fields
        if (!title || !order_number || !unit_id) {
            return res.status(400).json({ message: 'Title, order_number, and unit_id are required' });
        }

        try {
            const newLesson = new Lesson({
                title,
                description,
                order_number,
                grammar_focus,
                vocabulary_words,
                vocabulary_phrases,
                unit_id
            });

            await newLesson.save();

            // Initialize lesson status
            const lessonStatus = new LessonStatus({
                lesson_id: newLesson._id,
                unit_id,
                user_id: req.body.user_id, // Assuming user_id is passed in the request body
                status: 'locked' // Default status
            });

            await lessonStatus.save();

            res.status(201).json({
                message: 'Lesson created successfully',
                lesson_id: newLesson._id
            });
        } catch (error) {
            console.error('Error creating lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update lesson
    updateLesson: async (req, res) => {
        const { title, description, order_number } = req.body;

        try {
            const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, { title, description, order_number }, { new: true });

            if (!updatedLesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json({ message: 'Lesson updated successfully', lesson: updatedLesson });
        } catch (error) {
            console.error('Error updating lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete lesson
    deleteLesson: async (req, res) => {
        try {
            const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);

            if (!deletedLesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            // Optionally, delete associated lesson status
            await LessonStatus.deleteMany({ lesson_id: req.params.id });

            res.json({ message: 'Lesson deleted successfully' });
        } catch (error) {
            console.error('Error deleting lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get lessons by unit with user-specific status
    getLessonsByUnitWithStatus: async (req, res) => {
        const { unitId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        try {
            // Initialize lesson statuses if needed
            await initializeLessonStatuses(unitId, userId);

            const lessons = await Lesson.find({ unit_id: unitId }).populate('unit_id');
            const lessonStatuses = await LessonStatus.find({ unit_id: unitId, user_id: userId });
            const lessonsWithStatus = lessons.map(lesson => {
                const status = lessonStatuses.find(ls => ls.lesson_id.toString() === lesson._id.toString());
                return {
                    ...lesson.toObject(),
                    status: status ? status.status : 'locked' // Default to 'locked' if no status found
                };
            });

            res.json(lessonsWithStatus);
        } catch (error) {
            console.error('Error fetching lessons with status:', error);
            res.status(500).json({ error: 'Failed to fetch lessons' });
        }
    },

    // Update lesson status
    updateLessonStatus: async (req, res) => {
        const { lessonId } = req.params;
        const { status } = req.body;

        try {
            const updatedStatus = await LessonStatus.findOneAndUpdate(
                { lesson_id: lessonId, user_id: req.body.user_id }, // Assuming user_id is passed in the request body
                { status },
                { new: true, upsert: true } // Create if it doesn't exist
            );

            res.json({ message: 'Lesson status updated successfully', status: updatedStatus });
        } catch (error) {
            console.error('Error updating lesson status:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create multiple lessons
    createMultipleLessons: async (req, res) => {
        const lessonsData = req.body; // Assuming an array of lesson objects is sent in the request body

        if (!Array.isArray(lessonsData) || lessonsData.length === 0) {
            return res.status(400).json({ message: 'An array of lessons is required' });
        }

        try {
            const newLessons = await Lesson.insertMany(lessonsData);

            // Optionally, initialize lesson statuses for each new lesson
            const lessonStatuses = newLessons.map(lesson => ({
                lesson_id: lesson._id,
                unit_id: lesson.unit_id,
                user_id: req.body.user_id, // Assuming user_id is passed in the request body
                status: 'locked' // Default status
            }));

            await LessonStatus.insertMany(lessonStatuses);

            res.status(201).json({
                message: 'Lessons created successfully',
                lesson_ids: newLessons.map(lesson => lesson._id)
            });
        } catch (error) {
            console.error('Error creating multiple lessons:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = lessonController; 