const express = require('express');
const router = express.Router();
const unitRoutes = require('./unitRoutes');
const lessonRoutes = require('./lessonRoutes');
// const exerciseRoutes = require('./exerciseRoutes');

router.use('/units', unitRoutes);
router.use('/lessons', lessonRoutes);
// router.use('/exercises', exerciseRoutes);

module.exports = router; 