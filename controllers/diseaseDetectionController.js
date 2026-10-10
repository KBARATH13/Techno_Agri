const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const tempUploadsDir = path.join(__dirname, '../temp_uploads');
if (!fs.existsSync(tempUploadsDir)) {
    fs.mkdirSync(tempUploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

const DiseaseDetection = require('../models/DiseaseDetection');

const predictDisease = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const imagePath = req.file.path;
    const pythonScriptPath = path.join(__dirname, '../../AI/predict/predict_disease.py');

    // Convert image to base64 for database storage as requested
    let base64Image = '';
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const extensionName = path.extname(imagePath).substring(1);
        base64Image = `data:image/${extensionName};base64,${imageBuffer.toString('base64')}`;
    } catch (err) {
        console.error('Error reading file for base64 conversion:', err);
    }

    const pythonProcess = spawn('python', [pythonScriptPath, imagePath]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    pythonProcess.on('close', async (code) => {
        // Clean up the uploaded file from temp_uploads
        fs.unlink(imagePath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

        if (code !== 0) {
            console.error(`Python script exited with code ${code}: ${error}`);
            return res.status(500).json({ error: 'Failed to get disease prediction from AI model.', details: error });
        }

        try {
            const prediction = JSON.parse(result);

            if (prediction.is_leaf === false) {
                return res.json({
                    success: false,
                    error: prediction.message || 'The uploaded image does not appear to be a leaf.',
                    is_leaf: false,
                    top_predictions: prediction.top_predictions
                });
            }

            // Save to Database
            const newDetection = new DiseaseDetection({
                userId: req.user,
                disease: prediction.disease,
                confidence: prediction.confidence,
                image: base64Image
            });

            const savedDetection = await newDetection.save();

            // Store hash on Blockchain
            try {
                const blockchainService = require('../utils/BlockchainService');
                await blockchainService.setHash(savedDetection._id.toString(), {
                    disease: savedDetection.disease,
                    confidence: savedDetection.confidence,
                    userId: savedDetection.userId.toString()
                }, 'DISEASE_DETECTION');
                console.log(`Blockchain hash stored for disease detection: ${savedDetection._id}`);
            } catch (bcError) {
                console.error('Blockchain storage for disease detection failed:', bcError.message);
            }

            res.json({
                ...prediction,
                dbSaved: true,
                id: savedDetection._id
            });
        } catch (e) {
            console.error('Error parsing Python script output or saving to DB:', e);
            res.status(500).json({ error: 'Failed to process prediction results.', details: result });
        }
    });
};

module.exports = {
    upload, // Export upload middleware
    predictDisease
};