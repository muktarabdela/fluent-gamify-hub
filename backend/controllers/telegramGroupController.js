const { TelegramGroup } = require('../model/model'); // Import Mongoose models

const telegramGroupController = {
    // Get all telegram groups
    getAllGroups: async (req, res) => {
        try {
            const groups = await TelegramGroup.find().sort({ created_at: -1 });
            res.json(groups);
        } catch (error) {
            console.error('Error fetching telegram groups:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get an available telegram group
    getAvailableGroup: async (req, res) => {
        try {
            const group = await TelegramGroup.findOne({ status: 'available' }).sort({ last_used_at: 1 });

            if (!group) {
                return res.status(404).json({ message: 'No available groups found' });
            }

            res.json(group);
        } catch (error) {
            console.error('Error fetching available group:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get telegram group by ID
    getGroupById: async (req, res) => {
        try {
            const group = await TelegramGroup.findById(req.params.id);

            if (!group) {
                return res.status(404).json({ message: 'Telegram group not found' });
            }

            res.json(group);
        } catch (error) {
            console.error('Error fetching telegram group:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new telegram group
    createGroup: async (req, res) => {
        const { telegram_chat_id, status } = req.body;

        if (!telegram_chat_id) {
            return res.status(400).json({
                message: 'telegram_chat_id is required'
            });
        }

        try {
            const newGroup = new TelegramGroup({
                telegram_chat_id,
                status: status || 'available'
            });

            await newGroup.save();
            res.status(201).json(newGroup);
        } catch (error) {
            console.error('Error creating telegram group:', error);
            res.status(500).json({
                message: 'Failed to create telegram group',
                error: error.message
            });
        }
    },

    // Update telegram group
    updateGroup: async (req, res) => {
        const { telegram_chat_id, status } = req.body;

        try {
            const updatedGroup = await TelegramGroup.findByIdAndUpdate(
                req.params.id,
                {
                    telegram_chat_id,
                    status,
                    last_used_at: status === 'in_use' ? Date.now() : undefined
                },
                { new: true }
            );

            if (!updatedGroup) {
                return res.status(404).json({ message: 'Telegram group not found' });
            }

            res.json({ message: 'Telegram group updated successfully', group: updatedGroup });
        } catch (error) {
            console.error('Error updating telegram group:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete telegram group
    deleteGroup: async (req, res) => {
        try {
            const result = await TelegramGroup.findByIdAndDelete(req.params.id);

            if (!result) {
                return res.status(404).json({ message: 'Telegram group not found' });
            }

            res.json({ message: 'Telegram group deleted successfully' });
        } catch (error) {
            console.error('Error deleting telegram group:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = telegramGroupController; 