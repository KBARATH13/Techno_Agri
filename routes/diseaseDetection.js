const express = require('express');
const router = express.Router();
const diseaseDetectionController = require('../controllers/diseaseDetectionController');
const auth = require('../middleware/auth');

router.post('/predict', auth, diseaseDetectionController.upload.single('image'), diseaseDetectionController.predictDisease);

module.exports = router;