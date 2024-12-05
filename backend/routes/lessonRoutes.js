const express = require('express');
const router = express.Router();
const {
    getLessonsByUnit,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonsByUnitWithStatus,
    updateLessonStatus,
    getAllLessons,
    createMultipleLessons
} = require('../controllers/lessonController');
router.get('/', getAllLessons);

router.get('/unit/:unitId', getLessonsByUnitWithStatus);
router.get('/:id', getLessonById);
router.post('/', createLesson);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);
router.put('/:lessonId/status', updateLessonStatus);
router.post('/bulk', createMultipleLessons);

module.exports = router; 