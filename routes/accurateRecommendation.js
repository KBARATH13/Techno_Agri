const express = require('express');
const router = express.Router();
const accurateRecommendationController = require('../controllers/accurateRecommendationController');

router.post('/accurate', accurateRecommendationController.predictAccurateRecommendation);

module.exports = router;