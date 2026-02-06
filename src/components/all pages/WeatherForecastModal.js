import React, { useState } from 'react';
import './WeatherForecastModal.css';

const WeatherForecastModal = ({ weatherData, onClose }) => {
    const [selectedDay, setSelectedDay] = useState(null);

    if (!weatherData || !weatherData.forecast) {
        return null;
    }

    const { forecast } = weatherData;

    const handleDayClick = (day) => {
        // If the same day is clicked again, hide the hourly forecast
        if (selectedDay && selectedDay.date === day.date) {
            setSelectedDay(null);
        } else {
            setSelectedDay(day);
        }
    };

    return (
        <div className="weather-modal-backdrop visible" onClick={onClose}>
            <div className="weather-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>14-Day Forecast for {weatherData.location.name}</h2>
                <button className="modal-close-btn" onClick={onClose}>×</button>
                <div className="forecast-container">
                    {forecast.forecastday.map((day) => (
                        <div 
                            key={day.date_epoch} 
                            className={`forecast-day ${selectedDay && selectedDay.date === day.date ? 'active' : ''}`}
                            onClick={() => handleDayClick(day)}
                        >
                            <div className="forecast-date">{day.date.substring(5)}</div>
                            <div className="forecast-icon">
                                <img src={day.day.condition.icon} alt={day.day.condition.text} />
                            </div>
                            <div className="forecast-temp">
                                {Math.round(day.day.maxtemp_c)}°/{Math.round(day.day.mintemp_c)}°
                            </div>
                            <div className="forecast-condition">{day.day.condition.text}</div>
                        </div>
                    ))}
                </div>

                {selectedDay && (
                    <div className="hourly-forecast-section">
                        <h3>Hourly Forecast for {selectedDay.date}</h3>
                        <div className="hourly-forecast-container">
                            {selectedDay.hour.map((hour, index) => (
                                <div key={index} className="hourly-item">
                                    <div className="hourly-time">{hour.time.substring(11)}</div>
                                    <div className="hourly-icon">
                                        <img src={hour.condition.icon} alt={hour.condition.text} />
                                    </div>
                                    <div className="hourly-temp">{Math.round(hour.temp_c)}°C</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherForecastModal;
