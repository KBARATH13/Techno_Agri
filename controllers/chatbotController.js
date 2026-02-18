const runPythonScript = require('../utils/ChatbotRunner');
const path = require('path');
const ChatMessage = require('../models/ChatMessage');
const mongoose = require('mongoose');

const chatWithBot = async (req, res) => {
    const { query, sessionId } = req.body;
    const userId = req.user;

    if (!query || !sessionId) {
        return res.status(400).json({ error: 'Query and sessionId are required.' });
    }

    try {
        const scriptPath = path.join(__dirname, '..', '..', 'AI', 'predict', 'rag_chatbot_cli.py');
        const inputData = { query };

        const result = await runPythonScript(scriptPath, inputData);
        const responseText = result.response;

        // Generate hash for integrity
        const hash = ChatMessage.generateHash(userId, sessionId, query, responseText);

        // Store message in database
        const newMessage = new ChatMessage({
            userId,
            sessionId,
            query,
            response: responseText,
            hash
        });
        await newMessage.save();

        res.json(result);

    } catch (error) {
        console.error('Error in chatbot controller:', error);
        res.status(500).json({ error: 'Failed to get response from chatbot.', details: error.message });
    }
};

const getChatHistory = async (req, res) => {
    try {
        console.log("Fetching chat history for user:", req.user);

        if (!req.user) {
            console.log("No req.user found in getChatHistory");
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Use a simple find first to see if it even works
        const allMessages = await ChatMessage.find({ userId: req.user }).sort({ timestamp: 1 }).lean();
        console.log(`Found ${allMessages.length} total messages for user`);

        const sessionsMap = {};
        allMessages.forEach(msg => {
            const sId = msg.sessionId || 'legacy';
            if (!sessionsMap[sId]) {
                sessionsMap[sId] = {
                    _id: sId,
                    topic: msg.query || 'Untitled Chat',
                    timestamp: msg.timestamp || new Date()
                };
            }
        });

        const history = Object.values(sessionsMap).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log(`Returning ${history.length} unique sessions`);

        res.json(history);
    } catch (error) {
        console.error('CRITICAL ERROR in getChatHistory:', error);
        res.status(500).json({
            error: 'Failed to fetch chat history.',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getChatMessagesBySession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        if (!req.user) return res.status(401).json({ error: 'User not authenticated' });

        const messages = await ChatMessage.find({
            userId: req.user,
            sessionId: sessionId === 'legacy' ? { $exists: false } : sessionId
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching session messages:', error);
        res.status(500).json({ error: 'Failed to fetch session messages.', details: error.message });
    }
};

module.exports = {
    chatWithBot,
    getChatHistory,
    getChatMessagesBySession
};
