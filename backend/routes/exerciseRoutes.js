const express = require('express');
const router = express.Router();
const {
    getExercisesByLesson,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    submitExerciseAnswer,
    getExercisesByLessonWithProgress,
    createMultipleExercises
} = require('../controllers/exerciseController');

router.get('/lesson/:lessonId', getExercisesByLessonWithProgress);
router.get('/:id', getExerciseById);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);
router.post('/:id/submit', submitExerciseAnswer);
router.post('/multiple', createMultipleExercises);

module.exports = router; 