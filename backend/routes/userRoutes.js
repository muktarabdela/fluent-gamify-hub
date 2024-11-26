const express = require('express');
const router = express.Router();
const {
    createOrUpdateUser,
    getUserById,
    getAllUsers,
    updateUserPreferences,
    deleteUser,
    getUserProgress,
    updateUserProgress,
    getUserStreak,
    updateUserStreak
} = require('../controllers/userController');

router.post('/', createOrUpdateUser);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.put('/:id/preferences', updateUserPreferences);
router.delete('/:id', deleteUser);
router.get('/:id/progress', getUserProgress);
router.post('/:id/progress', updateUserProgress);
router.get('/:id/streak', getUserStreak);
router.put('/:id/streak', updateUserStreak);

module.exports = router; 