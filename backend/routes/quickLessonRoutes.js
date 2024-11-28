const express = require('express');
const router = express.Router();
const quickLessonController = require('../controllers/quickLessonController');

router.get('/lesson/:lessonId', quickLessonController.getQuickLessonByLessonId);
router.post('/', quickLessonController.createQuickLesson);
router.put('/:id', quickLessonController.updateQuickLesson);
router.delete('/:id', quickLessonController.deleteQuickLesson);

module.exports = router; 