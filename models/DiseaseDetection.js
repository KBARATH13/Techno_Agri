const mongoose = require('mongoose');

const DiseaseDetectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    disease: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    image: {
        type: String, // Base64 encoded image string
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DiseaseDetection', DiseaseDetectionSchema);
