const express = require('express');
const router = express.Router();
const {
    getLessonsByUnit,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonsByUnitWithStatus,
    updateLessonStatus
} = require('../controllers/lessonController');

router.get('/unit/:unitId', getLessonsByUnitWithStatus);
router.get('/:id', getLessonById);
router.post('/', createLesson);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);
router.put('/:lessonId/status', updateLessonStatus);

module.exports = router; 