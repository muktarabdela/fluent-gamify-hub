const { Dialogue } = require('../model/model'); // Import Mongoose models

const dialogueController = {
    // Get dialogues by lesson ID
    getDialoguesByLesson: async (req, res) => {
        try {
            const dialogues = await Dialogue.find({ lesson_id: req.params.lessonId })
                .sort({ sequence_order: 1 }); // Sort by sequence_order
            res.json(dialogues);
        } catch (error) {
            console.error('Error fetching dialogues:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get dialogue by ID
    getDialogueById: async (req, res) => {
        try {
            const dialogue = await Dialogue.findById(req.params.id);

            if (!dialogue) {
                return res.status(404).json({ message: 'Dialogue not found' });
            }

            res.json(dialogue);
        } catch (error) {
            console.error('Error fetching dialogue:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new dialogue
    createDialogue: async (req, res) => {
        const { lesson_id, speaker_name, speaker_role, sequence_order, content, audio_url } = req.body;

        if (!lesson_id || !speaker_name || !sequence_order || !content) {
            return res.status(400).json({
                message: 'lesson_id, speaker_name, sequence_order, and content are required'
            });
        }

        try {
            const newDialogue = new Dialogue({
                lesson_id,
                speaker_name,
                speaker_role,
                sequence_order,
                content,
                audio_url
            });

            await newDialogue.save();

            res.status(201).json(newDialogue);
        } catch (error) {
            console.error('Error creating dialogue:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create multiple dialogues at once
    createBulkDialogues: async (req, res) => {
        const { dialogues } = req.body;

        if (!Array.isArray(dialogues) || dialogues.length === 0) {
            return res.status(400).json({
                message: 'dialogues array is required and must not be empty'
            });
        }

        try {
            const newDialogues = await Dialogue.insertMany(dialogues);

            res.status(201).json(newDialogues);
        } catch (error) {
            console.error('Error creating bulk dialogues:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update dialogue
    updateDialogue: async (req, res) => {
        const { speaker_name, speaker_role, sequence_order, content, audio_url } = req.body;

        try {
            const updatedDialogue = await Dialogue.findByIdAndUpdate(req.params.id, {
                speaker_name,
                speaker_role,
                sequence_order,
                content,
                audio_url
            }, { new: true });

            if (!updatedDialogue) {
                return res.status(404).json({ message: 'Dialogue not found' });
            }

            res.json({ message: 'Dialogue updated successfully', dialogue: updatedDialogue });
        } catch (error) {
            console.error('Error updating dialogue:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete dialogue
    deleteDialogue: async (req, res) => {
        try {
            const deletedDialogue = await Dialogue.findByIdAndDelete(req.params.id);

            if (!deletedDialogue) {
                return res.status(404).json({ message: 'Dialogue not found' });
            }

            res.json({ message: 'Dialogue deleted successfully' });
        } catch (error) {
            console.error('Error deleting dialogue:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = dialogueController; 