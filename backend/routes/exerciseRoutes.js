const express = require('express');
const router = express.Router();
const {
    getExercisesByLesson,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    submitExerciseAnswer,
    getExercisesByLessonWithProgress
} = require('../controllers/exerciseController');

router.get('/lesson/:lessonId', getExercisesByLessonWithProgress);
router.get('/:id', getExerciseById);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);
router.post('/:id/submit', submitExerciseAnswer);

module.exports = router; 