const { Unit, Lesson, UserProgress } = require('../model/model'); // Import Mongoose models

const unitController = {
    // Get all units with lesson counts and progress
    getAllUnits: async (req, res) => {
        try {
            const userId = req.query.userId; // Get userId from query params

            const units = await Unit.find()

            res.json(units);
        } catch (error) {
            console.error('Error fetching units:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get unit by ID
    getUnitById: async (req, res) => {
        try {
            const unit = await Unit.findById(req.params.id).populate('lessons'); // Populate lessons if needed

            if (!unit) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json(unit);
        } catch (error) {
            console.error('Error fetching unit:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new unit
    createUnit: async (req, res) => {
        const { title, description, order_number, total_lessons, completed_lessons, progress_percentage, is_active } = req.body;

        // Validate required fields
        if (!title || !order_number) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'Title and order_number are required'
            });
        }

        try {
            const newUnit = new Unit({
                title,
                description,
                order_number,
                total_lessons: total_lessons || 0,
                completed_lessons: completed_lessons || 0,
                progress_percentage: progress_percentage || 0.00,
                is_active: is_active !== undefined ? is_active : true
            });

            await newUnit.save();

            res.status(201).json(newUnit);
        } catch (error) {
            console.error('Error creating unit:', error);
            res.status(500).json({
                message: 'Failed to create unit',
                error: error.message
            });
        }
    },

    // Update unit
    updateUnit: async (req, res) => {
        const { title, description, order_number } = req.body;

        try {
            const updatedUnit = await Unit.findByIdAndUpdate(req.params.id, { title, description, order_number }, { new: true });

            if (!updatedUnit) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json({ message: 'Unit updated successfully', unit: updatedUnit });
        } catch (error) {
            console.error('Error updating unit:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete unit
    deleteUnit: async (req, res) => {
        try {
            const deletedUnit = await Unit.findByIdAndDelete(req.params.id);

            if (!deletedUnit) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json({ message: 'Unit deleted successfully' });
        } catch (error) {
            console.error('Error deleting unit:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update unit progress
    updateUnitProgress: async (req, res) => {
        const { unitId } = req.params;
        try {
            const progress = await Lesson.aggregate([
                { $match: { unit_id: unitId } },
                {
                    $group: {
                        _id: null,
                        total_lessons: { $sum: 1 },
                        completed_lessons: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
                    }
                }
            ]);

            if (progress.length > 0) {
                const { total_lessons, completed_lessons } = progress[0];
                const progress_percentage = total_lessons > 0
                    ? (completed_lessons / total_lessons) * 100
                    : 0;

                // Update unit with new progress
                await Unit.findByIdAndUpdate(unitId, {
                    total_lessons,
                    completed_lessons,
                    progress_percentage
                });

                res.json({ total_lessons, completed_lessons, progress_percentage });
            } else {
                res.status(404).json({ message: 'Unit not found' });
            }
        } catch (error) {
            console.error('Error updating unit progress:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = unitController; 