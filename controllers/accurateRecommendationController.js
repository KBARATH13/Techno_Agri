const runPythonScript = require('../utils/PythonRunner');

const predictAccurateRecommendation = async (req, res) => {
    const { N, P, K, temperature, humidity, ph, rainfall, language } = req.body;

    // Basic validation
    if ([N, P, K, temperature, humidity, ph, rainfall].some(val => val === undefined)) {
        return res.status(400).json({ error: 'All seven input fields are required.' });
    }

    const scriptPath = 'D:/code/FinalYearProject/smart farm/AI/predict/predict_crop_recommendation.py';
    const scriptData = {
        language: language || 'en',
        params: { N, P, K, temperature, humidity, ph, rainfall }
    };

    try {
        const result = await runPythonScript(scriptPath, scriptData);
        res.json(result); // result should be { "recommended_crop": "..." }
    } catch (err) {
        res.status(err.status || 500).json({ error: err.error, details: err.details });
    }
};

module.exports = {
    predictAccurateRecommendation
};