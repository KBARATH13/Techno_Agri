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

const predictDisease = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const imagePath = req.file.path;
    const pythonScriptPath = path.join(__dirname, '../../AI/predict/predict_disease.py');

    const pythonProcess = spawn('python', [pythonScriptPath, imagePath]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    pythonProcess.on('close', (code) => {
        // Clean up the uploaded file
        fs.unlink(imagePath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

        if (code !== 0) {
            console.error(`Python script exited with code ${code}: ${error}`);
            return res.status(500).json({ error: 'Failed to get disease prediction from AI model.', details: error });
        }

        try {
            const prediction = JSON.parse(result);
            res.json(prediction);
        } catch (e) {
            console.error('Error parsing Python script output:', e);
            res.status(500).json({ error: 'Failed to parse prediction from AI model output.', details: result });
        }
    });
};

module.exports = {
    upload, // Export upload middleware
    predictDisease
};