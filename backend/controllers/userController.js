const { User, UserStreak, UserProgress, LessonStatus, Lesson } = require('../model/model'); // Import Mongoose models

// Helper function to initialize user progress
const initializeUserProgress = async (userId) => {
    try {
        // Get all lessons ordered by unit and lesson order
        const lessons = await Lesson.find().sort({ order_number: 1 }); // Adjust sorting as needed

        if (lessons.length === 0) return;

        // First lesson of first unit should be 'in_progress', rest should be 'locked'
        const userProgressData = lessons.map((lesson, index) => {
            const status = index === 0 ? 'in_progress' : 'locked'; // Change 'started' to 'in_progress'
            return {
                user_id: userId,
                lesson_id: lesson._id,
                status,
                score: 0,
                created_at: new Date(),
                updated_at: new Date()
            };
        });

        // Batch insert all progress records
        await UserProgress.insertMany(userProgressData);

        console.log(`Initialized progress for user ${userId} with ${lessons.length} lessons`);
    } catch (error) {
        console.error('Error initializing user progress:', error);
        throw error;
    }
};

const userController = {
    // Create or update user from Telegram data
    createOrUpdateUser: async (req, res) => {
        const {
            id,
            username,
            first_name,
            last_name = null,
            auth_date
        } = req.body;

        if (!id || !first_name) {
            return res.status(400).json({
                message: 'User ID and first name are required'
            });
        }

        try {
            // Check if user exists
            const existingUser = await User.findOne({ user_id: id });

            if (!existingUser) {
                // Create new user
                const newUser = new User({
                    user_id: id,
                    username,
                    first_name,
                    last_name,
                    auth_date
                });

                await newUser.save();

                // Initialize user progress for all available lessons
                await initializeUserProgress(id);

                // Initialize user streak
                const newStreak = new UserStreak({
                    user_id: id,
                    current_streak: 0,
                    longest_streak: 0
                });
                await newStreak.save();

                res.status(201).json(newUser);
            } else {
                // Update existing user
                existingUser.username = username;
                existingUser.first_name = first_name;
                existingUser.last_name = last_name;
                existingUser.auth_date = auth_date;
                existingUser.updated_at = Date.now();

                await existingUser.save();

                res.json(existingUser);
            }
        } catch (error) {
            console.error('Error creating/updating user:', error);
            res.status(500).json({
                message: 'Failed to create/update user',
                error: error.message
            });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const user = await User.findOne({ user_id: req.params.id });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update user preferences
    updateUserPreferences: async (req, res) => {
        const { preferences } = req.body;
        const { country, interests, onboarding_completed, like_coins_increment } = preferences;

        try {
            const user = await User.findOne({ user_id: req.params.id });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (like_coins_increment) {
                // Increment LIKE coins
                user.like_coins += like_coins_increment;
            } else {
                // Regular preferences update
                user.country = country;
                user.interests = interests;
                user.onboarding_completed = onboarding_completed;
            }

            user.updated_at = Date.now();
            await user.save();

            res.json({
                message: 'User preferences updated successfully',
                preferences: {
                    country,
                    interests,
                    onboarding_completed,
                    like_coins_increment
                }
            });
        } catch (error) {
            console.error('Error updating user preferences:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get user progress
    getUserProgress: async (req, res) => {
        try {
            const progress = await UserProgress.find({ user_id: req.params.id })
                .populate('lesson_id')
                .populate('exercise_id');

            res.json(progress);
        } catch (error) {
            console.error('Error fetching user progress:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update user progress
    updateUserProgress: async (req, res) => {
        const { lesson_id, status, score } = req.body;
        const user_id = req.params.id;

        try {
            const progress = await UserProgress.findOneAndUpdate(
                { user_id, lesson_id },
                { status, score },
                { upsert: true, new: true }
            );

            res.json(progress);
        } catch (error) {
            console.error('Error updating user progress:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get user streak
    getUserStreak: async (req, res) => {
        try {
            const streak = await UserStreak.findOne({ user_id: req.params.id });

            if (!streak) {
                return res.status(404).json({
                    message: 'Streak not found for this user'
                });
            }

            res.json(streak);
        } catch (error) {
            console.error('Error fetching user streak:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update user streak
    updateUserStreak: async (req, res) => {
        try {
            const userId = req.params.id;

            // Check if streak was already updated today based on updated_at
            const currentStreak = await UserStreak.findOne({ user_id: userId });

            if (currentStreak && currentStreak.updated_at.toDateString() === new Date().toDateString()) {
                // Already updated today, just return current streak
                res.json(currentStreak);
                return;
            }

            // Update the streak since it hasn't been updated today
            await updateStreak(userId);

            // Get and return the updated streak
            const streak = await UserStreak.findOne({ user_id: userId });

            if (!streak) {
                return res.status(404).json({ message: 'Streak not found' });
            }

            res.json(streak);
        } catch (error) {
            console.error('Error updating user streak:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const deletedUser = await User.findOneAndDelete({ user_id: userId });

            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Optionally, delete associated user progress and streaks
            await UserProgress.deleteMany({ user_id: userId });
            await UserStreak.deleteMany({ user_id: userId });

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get lesson status by user ID
    getLessonStatusByUserId: async (req, res) => {
        const userId = req.params.id; // Assuming user ID is passed in the URL

        try {
            const lessonStatuses = await LessonStatus.find({ user_id: userId })
                .populate('lesson_id') // Populate lesson details if needed
                .populate('unit_id'); // Populate unit details if needed

            if (!lessonStatuses || lessonStatuses.length === 0) {
                return res.status(404).json({ message: 'No lesson statuses found for this user' });
            }

            res.json(lessonStatuses);
        } catch (error) {
            console.error('Error fetching lesson statuses:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userController; 