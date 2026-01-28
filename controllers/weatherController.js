const axios = require('axios');

const getWeather = async (req, res) => {
    const { location, lat, lon } = req.query;
    let queryParam;

    if (lat && lon) {
        queryParam = `${lat},${lon}`;
    } else if (location) {
        queryParam = location;
    } else {
        return res.status(400).json({ error: 'Location or Latitude/Longitude are required.' });
    }

    try {
        const apiKey = process.env.WEATHER_API_KEY; // Using environment variable for WeatherAPI
        if (!apiKey) {
            throw new Error('WeatherAPI key not configured on server.');
        }
        // WeatherAPI forecast endpoint for 14 days
        const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${queryParam}&days=14&aqi=yes&alerts=no`;
        
        const weatherResponse = await axios.get(url);
        res.json(weatherResponse.data);
    } catch (error) {
        console.error('Weather API proxy error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch weather data.' });
    }
};

module.exports = {
    getWeather
};
