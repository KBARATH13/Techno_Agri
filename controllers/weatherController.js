const axios = require('axios');

// Map WMO World Meteorological Organization weather codes to WeatherAPI-like descriptions and icons
const mapWmoCode = (code) => {
    const mapping = {
        0: { text: "Clear sky", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" },
        1: { text: "Mainly clear", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" },
        2: { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" },
        3: { text: "Overcast", icon: "//cdn.weatherapi.com/weather/64x64/day/122.png" },
        45: { text: "Fog", icon: "//cdn.weatherapi.com/weather/64x64/day/248.png" },
        48: { text: "Depositing rime fog", icon: "//cdn.weatherapi.com/weather/64x64/day/248.png" },
        51: { text: "Light drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png" },
        53: { text: "Moderate drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png" },
        55: { text: "Dense drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png" },
        61: { text: "Slight rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" },
        63: { text: "Moderate rain", icon: "//cdn.weatherapi.com/weather/64x64/day/302.png" },
        65: { text: "Heavy rain", icon: "//cdn.weatherapi.com/weather/64x64/day/308.png" },
        71: { text: "Slight snow fall", icon: "//cdn.weatherapi.com/weather/64x64/day/326.png" },
        73: { text: "Moderate snow fall", icon: "//cdn.weatherapi.com/weather/64x64/day/332.png" },
        75: { text: "Heavy snow fall", icon: "//cdn.weatherapi.com/weather/64x64/day/338.png" },
        80: { text: "Slight rain showers", icon: "//cdn.weatherapi.com/weather/64x64/day/353.png" },
        81: { text: "Moderate rain showers", icon: "//cdn.weatherapi.com/weather/64x64/day/356.png" },
        82: { text: "Violent rain showers", icon: "//cdn.weatherapi.com/weather/64x64/day/359.png" },
        95: { text: "Thunderstorm", icon: "//cdn.weatherapi.com/weather/64x64/day/389.png" },
    };
    return mapping[code] || { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" };
};

const getWeather = async (req, res) => {
    const { location, lat, lon } = req.query;
    let queryParam;
    let latitude = lat;
    let longitude = lon;

    if (lat && lon) {
        queryParam = `${lat},${lon}`;
    } else if (location) {
        queryParam = location;
    } else {
        return res.status(400).json({ error: 'Location or Latitude/Longitude are required.' });
    }

    try {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('WeatherAPI key not configured on server.');
        }

        // 1. Fetch Current Weather & AQI from WeatherAPI
        const weatherApiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${queryParam}&days=1&aqi=yes&alerts=no`;
        const weatherApiResponse = await axios.get(weatherApiUrl);
        const data = weatherApiResponse.data;

        // Extract lat/lon for Open-Meteo if not provided in query
        if (!latitude || !longitude) {
            latitude = data.location.lat;
            longitude = data.location.lon;
        }

        // 2. Fetch 14-Day Free Forecast from Open-Meteo
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=14`;
        const openMeteoResponse = await axios.get(openMeteoUrl);
        const omData = openMeteoResponse.data;

        // 3. Transform Open-Meteo data to match WeatherAPI format used by frontend
        const transformedForecast = omData.daily.time.map((date, index) => {
            const condition = mapWmoCode(omData.daily.weather_code[index]);

            // Map hourly data for this day
            const dayHourly = [];
            const dayStartIdx = index * 24;
            for (let h = 0; h < 24; h++) {
                const globalH = dayStartIdx + h;
                const hCondition = mapWmoCode(omData.hourly.weather_code[globalH]);
                dayHourly.push({
                    time: omData.hourly.time[globalH],
                    temp_c: omData.hourly.temperature_2m[globalH],
                    condition: {
                        text: hCondition.text,
                        icon: hCondition.icon
                    }
                });
            }

            return {
                date: date,
                date_epoch: Math.floor(new Date(date).getTime() / 1000),
                day: {
                    maxtemp_c: omData.daily.temperature_2m_max[index],
                    mintemp_c: omData.daily.temperature_2m_min[index],
                    condition: {
                        text: condition.text,
                        icon: condition.icon
                    }
                },
                hour: dayHourly
            };
        });

        // 4. Combine: Use WeatherAPI for Current/Location and Open-Meteo for Forecast
        const finalData = {
            location: data.location,
            current: data.current,
            forecast: {
                forecastday: transformedForecast
            }
        };

        res.json(finalData);

    } catch (error) {
        console.error('Weather Integration Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch comprehensive weather data.' });
    }
};

module.exports = {
    getWeather
};
