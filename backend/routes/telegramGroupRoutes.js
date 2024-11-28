const express = require('express');
const router = express.Router();
const {
    getAllGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    getAvailableGroup
} = require('../controllers/telegramGroupController');

router.get('/', getAllGroups);
router.get('/available', getAvailableGroup);
router.get('/:id', getGroupById);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router; 