const fs = require('fs');
const path = require('path');

// Load the new internationalized recommendation data at startup
const recommendationsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'translations', 'recommendations.json');
let recommendations = {};
try {
    recommendations = JSON.parse(fs.readFileSync(recommendationsPath, 'utf8'));
    console.log("Loaded NEW internationalized crop recommendation data.");
} catch (error) {
    console.error("FATAL: Could not load internationalized recommendations data.", error);
}


const getDistricts = (req, res) => {
    try {
        const districts = Object.keys(recommendations).map(districtKey => {
            return {
                en: districtKey,
                ta: recommendations[districtKey].ta
            };
        });
        res.json(districts);
    } catch (error) {
        console.error('Error in getDistricts:', error);
        res.status(500).json({ error: 'Failed to load district data.' });
    }
};

const getSoils = (req, res) => {
    const { district } = req.query; // district is the English key

    if (!district) {
        return res.status(400).json({ error: 'District query parameter is required.' });
    }

    const districtData = recommendations[district];
    if (!districtData || !districtData.soils) {
        return res.status(404).json({ error: `No data found for district: ${district}` });
    }

    try {
        const soils = Object.keys(districtData.soils).map(soilKey => {
            return {
                en: soilKey,
                ta: districtData.soils[soilKey].ta
            };
        });
        res.json(soils);
    } catch (error) {
        console.error(`Error in getSoils for district ${district}:`, error);
        res.status(500).json({ error: 'Failed to load soil data.' });
    }
};

const getAppropriateRecommendation = (req, res) => {
    const { district, soil_type } = req.query; // Both are the English keys

    if (!district || !soil_type) {
        return res.status(400).json({ error: 'District and soil_type query parameters are required.' });
    }

    try {
        const districtData = recommendations[district];

        if (!districtData || !districtData.soils) {
            return res.status(404).json({ error: `No data found for district: ${district}` });
        }

        const lowerCaseSoilType = soil_type.toLowerCase();
        let matchedCrops = [];
        let exactMatchFound = false;

        // First, try for an exact match
        if (districtData.soils[soil_type]) {
            matchedCrops = districtData.soils[soil_type].crops;
            exactMatchFound = true;
        } else {
            // If no exact match, look for partial matches (case-insensitive)
            for (const soilKey in districtData.soils) {
                if (soilKey.toLowerCase().includes(lowerCaseSoilType)) {
                    matchedCrops = matchedCrops.concat(districtData.soils[soilKey].crops);
                }
            }
        }

        if (matchedCrops.length === 0) {
            return res.status(404).json({ error: `No recommendations found for ${district} with soil ${soil_type}` });
        }

        // Remove duplicates from matchedCrops if any
        const uniqueCrops = Array.from(new Map(matchedCrops.map(crop => [crop.en, crop])).values());

        res.json({
            district: district,
            soil_type: soil_type,
            recommendations: uniqueCrops
        });

    } catch (error) {
        console.error(`Error in getAppropriateRecommendation for ${district}/${soil_type}:`, error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};

module.exports = {
    getDistricts,
    getSoils,
    getAppropriateRecommendation
};
