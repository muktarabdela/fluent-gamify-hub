const express = require('express');
const router = express.Router();
const {
    getDialoguesByLesson,
    getDialogueById,
    createDialogue,
    createBulkDialogues,
    updateDialogue,
    deleteDialogue
} = require('../controllers/dialogueController');

router.get('/lesson/:lessonId', getDialoguesByLesson);
router.get('/:id', getDialogueById);
router.post('/', createDialogue);
router.post('/bulk', createBulkDialogues);
router.put('/:id', updateDialogue);
router.delete('/:id', deleteDialogue);

module.exports = router; 