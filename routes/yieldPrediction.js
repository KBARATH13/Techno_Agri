const express = require('express');
const router = express.Router();
const yieldPredictionController = require('../controllers/yieldPredictionController');

router.get('/form-data', yieldPredictionController.getYieldFormData);
router.post('/predict', yieldPredictionController.predictYield);

module.exports = router;