const runPythonScript = require('../utils/PythonRunner');

const getYieldFormData = async (req, res) => {
    const { language } = req.query;
    const scriptPath = 'D:/code/FinalYearProject/smart farm/AI/predict/predict_crop_yield.py';
    const scriptData = {
        command: 'get_form_data',
        language: language || 'en'
    };

    try {
        const formData = await runPythonScript(scriptPath, scriptData);
        res.json(formData);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.error, details: err.details });
    }
};

const predictYield = async (req, res) => {
    let { district, crop_year, crop, area, area_unit, annual_rainfall, rainfall_unit, season, language } = req.body;

    if (!district || !crop_year || !crop || !area || !area_unit || !annual_rainfall || !rainfall_unit || !season) {
        return res.status(400).json({ error: 'All input fields are required.' });
    }

    const scriptPath = 'D:/code/FinalYearProject/smart farm/AI/predict/predict_crop_yield.py';
    const scriptData = {
        command: 'predict',
        language: language || 'en',
        params: {
            district,
            crop_year,
            crop,
            area,
            area_unit,
            annual_rainfall,
            rainfall_unit,
            season
        }
    };

    try {
        const result = await runPythonScript(scriptPath, scriptData);
        res.json(result);
    } catch (err) {
        console.error("Error from Python script execution:", err); // Log the full error object
        res.status(err.status || 500).json({ error: err.error, details: err.details });
    }
};

module.exports = {
    getYieldFormData,
    predictYield
};