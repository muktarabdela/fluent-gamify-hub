const { getPool } = require('../config/db');

const dialogueController = {
    // Get dialogues by lesson ID
    getDialoguesByLesson: async (req, res) => {
        try {
            const pool = getPool();
            const [dialogues] = await pool.query(
                `SELECT * FROM Dialogues 
                 WHERE lesson_id = ? 
                 ORDER BY sequence_order`,
                [req.params.lessonId]
            );
            res.json(dialogues);
        } catch (error) {
            console.error('Error fetching dialogues:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get dialogue by ID
    getDialogueById: async (req, res) => {
        try {
            const pool = getPool();
            const [dialogue] = await pool.query(
                'SELECT * FROM Dialogues WHERE dialogue_id = ?',
                [req.params.id]
            );

            if (dialogue.length === 0) {
                return res.status(404).json({ message: 'Dialogue not found' });
            }

            res.json(dialogue[0]);
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
            const pool = getPool();
            const [result] = await pool.query(
                `INSERT INTO Dialogues 
                (lesson_id, speaker_name, speaker_role, sequence_order, content, audio_url) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [lesson_id, speaker_name, speaker_role, sequence_order, content, audio_url]
            );

            const [newDialogue] = await pool.query(
                'SELECT * FROM Dialogues WHERE dialogue_id = ?',
                [result.insertId]
            );

            res.status(201).json(newDialogue[0]);
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
            const pool = getPool();
            const values = dialogues.map(d => [
                d.lesson_id,
                d.speaker_name,
                d.speaker_role,
                d.sequence_order,
                d.content,
                d.audio_url
            ]);

            const [result] = await pool.query(
                `INSERT INTO Dialogues 
                (lesson_id, speaker_name, speaker_role, sequence_order, content, audio_url) 
                VALUES ?`,
                [values]
            );

            const [insertedDialogues] = await pool.query(
                `SELECT * FROM Dialogues 
                 WHERE dialogue_id >= ? AND dialogue_id < ?`,
                [result.insertId, result.insertId + dialogues.length]
            );

            res.status(201).json(insertedDialogues);
        } catch (error) {
            console.error('Error creating bulk dialogues:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update dialogue
    updateDialogue: async (req, res) => {
        const { speaker_name, speaker_role, sequence_order, content, audio_url } = req.body;

        try {
            const pool = getPool();
            const [result] = await pool.query(
                `UPDATE Dialogues 
                 SET speaker_name = ?, speaker_role = ?, sequence_order = ?, 
                     content = ?, audio_url = ?
                 WHERE dialogue_id = ?`,
                [speaker_name, speaker_role, sequence_order, content, audio_url, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Dialogue not found' });
            }

            res.json({ message: 'Dialogue updated successfully' });
        } catch (error) {
            console.error('Error updating dialogue:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete dialogue
    deleteDialogue: async (req, res) => {
        try {
            const pool = getPool();
            const [result] = await pool.query(
                'DELETE FROM Dialogues WHERE dialogue_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
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