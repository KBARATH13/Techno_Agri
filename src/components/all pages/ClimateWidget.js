
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClimateWidget.css';
import WeatherForecastModal from './WeatherForecastModal';
import './WeatherForecastModal.css';

const ClimateWidget = () => {
    const [weather, setWeather] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [userLocation, setUserLocation] = useState({ lat: null, lon: null, name: 'Chennai' }); // Default to Chennai
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchWeather = async (params) => {
            try {
                const response = await axios.get(`/api/weather`, { params });
                setWeather(response.data);
            } catch (error) {
                console.error("Error fetching weather data:", error);
                setWeather(null);
            }
        };

        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                            name: null // Name will be fetched by API
                        });
                        fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude });
                    },
                    (err) => {
                        console.warn(`ERROR(${err.code}): ${err.message}`);
                        // Fallback to default location if geolocation fails or is denied
                        fetchWeather({ location: userLocation.name });
                    }
                );
            } else {
                // Browser doesn't support Geolocation, fallback to default
                console.log("Geolocation not supported by this browser.");
                fetchWeather({ location: userLocation.name });
            }
        };

        getLocation();
    }, []); // Empty dependency array to run once on mount

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    if (!weather) {
        return <div className="climate-widget-loading">Loading Climate Data...</div>;
    }

    const { location: weatherLocation, current } = weather;

    const getAqiText = (aqiIndex) => {
        switch (aqiIndex) {
            case 1: return 'Good';
            case 2: return 'Moderate';
            case 3: return 'Unhealthy (SG)';
            case 4: return 'Unhealthy';
            case 5: return 'Very Unhealthy';
            case 6: return 'Hazardous';
            default: return 'N/A';
        }
    };

    // Format date and time
    const formatDate = (date) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <>
            <div className="climate-widget" onClick={toggleModal} title="Click for 14-day forecast">
                <div className="weather-icon">
                    <img src={current.condition.icon} alt={current.condition.text} />
                </div>
                <div className="weather-info">
                    <div className="info-row">
                        <span className="location">{weatherLocation.name}</span>
                        <span className="temperature">{current.temp_c}°C</span>
                    </div>
                    <div className="info-row">
                        <span className="date">{formatDate(currentTime)}</span>
                        <span className="air-quality">AQI: {getAqiText(current.air_quality['us-epa-index'])}</span>
                    </div>
                    <div className="info-row">
                        <span className="time">{formatTime(currentTime)}</span>
                        <span className="weather-condition">{current.condition.text}</span>
                    </div>
                </div>
            </div>
            {modalOpen && <WeatherForecastModal weatherData={weather} onClose={toggleModal} />}
        </>
    );
};

export default ClimateWidget;
