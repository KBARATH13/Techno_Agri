const express = require('express');
const router = express.Router();
const diseaseDetectionController = require('../controllers/diseaseDetectionController');

router.post('/predict', diseaseDetectionController.upload.single('image'), diseaseDetectionController.predictDisease);

module.exports = router;