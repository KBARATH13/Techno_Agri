const express = require('express');
const router = express.Router();
const cropRecommendationController = require('../controllers/cropRecommendationController');

router.get('/districts', cropRecommendationController.getDistricts);
router.get('/soils', cropRecommendationController.getSoils);
router.get('/appropriate', cropRecommendationController.getAppropriateRecommendation);

module.exports = router;