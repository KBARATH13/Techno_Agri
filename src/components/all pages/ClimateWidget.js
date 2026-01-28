
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClimateWidget.css';
import WeatherForecastModal from './WeatherForecastModal';
import './WeatherForecastModal.css';

const ClimateWidget = () => {
  const [weather, setWeather] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: null, lon: null, name: 'Chennai' }); // Default to Chennai

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

  return (
    <>
      <div className="climate-widget" onClick={toggleModal} title="Click for 14-day forecast">
        <div className="weather-icon">
          <img src={current.condition.icon} alt={current.condition.text} />
        </div>
        <div className="weather-info">
          <div className="location">{weatherLocation.name}</div>
          <div className="temperature">{current.temp_c}°C</div>
          <div className="air-quality">
            AQI: {getAqiText(current.air_quality['us-epa-index'])}
          </div>
        </div>
        <div className="weather-condition">
          {current.condition.text}
        </div>
      </div>
      {modalOpen && <WeatherForecastModal weatherData={weather} onClose={toggleModal} />}
    </>
  );
};

export default ClimateWidget;
