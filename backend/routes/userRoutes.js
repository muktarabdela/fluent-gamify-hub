const express = require('express');
const router = express.Router();
const {
    createOrUpdateUser,
    getUserById,
    getAllUsers,
    updateUserPreferences,
    deleteUser
} = require('../controllers/userController');

router.post('/', createOrUpdateUser);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.put('/:id/preferences', updateUserPreferences);
router.delete('/:id', deleteUser);

module.exports = router; 