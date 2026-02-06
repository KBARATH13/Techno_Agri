const express = require('express');
const axios = require('axios');
const router = express.Router();

// ESP32 IP address
const ESP32_URL = 'http://10.76.33.217/moisture';

router.get('/moisture', async (req, res) => {
    try {
        const response = await axios.get(ESP32_URL, { timeout: 5000 }); // 5s timeout
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from ESP32:', error.message);
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ error: 'Gateway Timeout: ESP32 not responding' });
        }
        res.status(502).json({ error: 'Bad Gateway: Failed to connect to ESP32' });
    }
});

module.exports = router;
