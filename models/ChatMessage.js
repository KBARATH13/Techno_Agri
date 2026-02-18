const mongoose = require('mongoose');
const crypto = require('crypto');

const ChatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Method to generate hash for a message pair
ChatMessageSchema.statics.generateHash = function (userId, sessionId, query, response) {
    const data = `${userId}:${sessionId}:${query}:${response}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
