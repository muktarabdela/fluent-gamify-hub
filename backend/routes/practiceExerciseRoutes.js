const express = require('express');
const router = express.Router();
const {
    // createTopic,
    getTopics,
    createExercise,
    getExercises,
    getCategories,
    getExerciseById
} = require('../controllers/practiceExerciseController');
// Get available topics
router.get('/topics', getTopics);


// Create new topic
// router.post('/topics', createTopic);
router.post('/exercises', createExercise);
router.get('/filtered', getExercises);
router.get('/categories', getCategories);
router.get('/exercises/:id', getExerciseById);


// Get all exercises by level and topic
// router.get('/exercises/all', getAllExercisesByLevelAndTopic);

module.exports = router; 
