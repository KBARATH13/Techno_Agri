const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

router.post('/chat', auth, chatbotController.chatWithBot);
router.get('/history', auth, chatbotController.getChatHistory);
router.get('/history/:sessionId', auth, chatbotController.getChatMessagesBySession);

module.exports = router;