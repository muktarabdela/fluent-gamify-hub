const express = require('express');
const router = express.Router();
const unitRoutes = require('./unitRoutes');
const lessonRoutes = require('./lessonRoutes');
const dialogueRoutes = require('./dialogueRoutes');
const exerciseRoutes = require('./exerciseRoutes');
const userRoutes = require('./userRoutes');
const liveSessionRoutes = require('./liveSessionRoutes');
const telegramGroupRoutes = require('./telegramGroupRoutes');
const botRoutes = require('./botRoutes');
const quickLessonRoutes = require('./quickLessonRoutes');
const practiceExerciseRoutes = require('./practiceExerciseRoutes');

// Add a route for the root URL
router.get('/', (req, res) => {
    res.send('Welcome to Fluent Gamify Hub API');
});

router.use('/units', unitRoutes);
router.use('/lessons', lessonRoutes);
router.use('/dialogues', dialogueRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/users', userRoutes);
router.use('/live-sessions', liveSessionRoutes);
router.use('/telegram-groups', telegramGroupRoutes);
router.use('/bot', botRoutes);
router.use('/quick-lessons', quickLessonRoutes);
router.use('/practice', practiceExerciseRoutes);

module.exports = router; 