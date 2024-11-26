const express = require('express');
const router = express.Router();
const unitRoutes = require('./unitRoutes');
const lessonRoutes = require('./lessonRoutes');
const dialogueRoutes = require('./dialogueRoutes');
const exerciseRoutes = require('./exerciseRoutes');
const userRoutes = require('./userRoutes');

router.use('/units', unitRoutes);
router.use('/lessons', lessonRoutes);
router.use('/dialogues', dialogueRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/users', userRoutes);

module.exports = router; 