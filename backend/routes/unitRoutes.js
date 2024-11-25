const express = require('express');
const router = express.Router();
const { 
    getAllUnits, 
    getUnitById, 
    createUnit, 
    updateUnit, 
    deleteUnit,
    updateUnitProgress 
} = require('../controllers/unitController');

router.get('/', getAllUnits);
router.get('/:id', getUnitById);
router.post('/', createUnit);
router.put('/:id', updateUnit);
router.delete('/:id', deleteUnit);
router.put('/:id/progress', updateUnitProgress);

module.exports = router; 