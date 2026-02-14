import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MoistureDisplay = () => {
  const [moisturePercentage, setMoisturePercentage] = useState(null);
  const [moistureLevel, setMoistureLevel] = useState(null);
  const [error, setError] = useState(null);

  // User needs to provide the actual ESP32 IP address
  const esp32IpAddress = '10.94.239.217';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Direct fetch from ESP32
        const response = await axios.get(`http://${esp32IpAddress}/moisture`, { timeout: 2000 });

        // Use the percentage calculated by the ESP32 (more accurate)
        // structure: { "moisture": 2500, "percentage": 45.5 }
        let percentage;

        if (response.data.percentage !== undefined) {
          percentage = parseFloat(response.data.percentage);
        } else {
          // Fallback: Use calibrated values from ESP32 code (AIR=3000, WATER=1000)
          const rawMoisture = response.data.moisture;
          const minSensorValue = 1000; // Wet
          const maxSensorValue = 3000; // Dry

          // Map raw value to 0-100%
          percentage = ((maxSensorValue - rawMoisture) / (maxSensorValue - minSensorValue)) * 100;
        }

        percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
        setMoisturePercentage(percentage.toFixed(1));

        // Determine moisture level
        if (percentage < 30) {
          setMoistureLevel('Dry');
        } else if (percentage >= 30 && percentage < 70) {
          setMoistureLevel('Moist');
        } else {
          setMoistureLevel('Wet');
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching moisture data:", err);
        // Only show error if we don't have a previous value (avoids flickering on single dropped packet)
        if (moisturePercentage === null) {
          setError('Connecting...');
        }
      }
    };

    // Fetch data initially and then every second
    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [moisturePercentage]); // Added dependency to allow error state logic to work naturally

  return (
    <div className="moisture-display">
      {error && <span style={{ color: 'orange', marginRight: '10px' }}>{error}</span>}
      {moisturePercentage !== null ? (
        <>
          <span>Moisture: {moisturePercentage}%</span>
          <span style={{ marginLeft: '10px' }}>Level: {moistureLevel}</span>
        </>
      ) : (
        !error && <span>Loading Moisture...</span>
      )}
    </div>
  );
};

export default MoistureDisplay;
