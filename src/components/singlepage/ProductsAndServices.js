
import React from 'react';
import './ProductsAndServices.css';
import { FaMicrochip, FaBrain, FaShippingFast, FaHandshake, FaSeedling, FaPaw, FaBug, FaCloudSun, FaMapMarkerAlt } from 'react-icons/fa';
import { GiWateringCan, GiGreenhouse } from 'react-icons/gi';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductsAndServices = () => {
  const { translate } = useLanguage();
  return (
    <div className="products-services-page">
      <h1>{translate('modern_agriculture_products_services')}</h1>

      <section className="section-container">
        <h2>{translate('our_offerings')}</h2>
        <div className="offerings-grid">
          <div className="offering-item">
            <FaMicrochip className="offering-logo" />
            <h3>{translate('smart_sensors')}</h3>
            <p>{translate('smart_sensors_description')}</p>
          </div>
          <div className="offering-item">
            <GiWateringCan className="offering-logo" />
            <h3>{translate('automated_irrigation_systems')}</h3>
            <p>{translate('automated_irrigation_description')}</p>
          </div>
          {/* <div className="offering-item">
            <h3>{translate('drone_based_crop_monitoring')}</h3>
            <p>{translate('drone_monitoring_description')}</p>
          </div> */}
          <div className="offering-item">
            <FaBrain className="offering-logo" />
            <h3>{translate('ai_powered_analytics_platform')}</h3>
            <p>{translate('ai_analytics_description')}</p>
          </div>
          <div className="offering-item">
            <FaShippingFast className="offering-logo" />
            <h3>{translate('supply_chain_solutions')}</h3>
            <p>{translate('supply_chain_description')}</p>
          </div>
          <div className="offering-item">
            <FaHandshake className="offering-logo" />
            <h3>{translate('market_linkage_platform')}</h3>
            <p>{translate('market_linkage_description')}</p>
          </div>
        </div>
      </section>

      <section className="section-container">
        <h2>{translate('advantages_of_sensors')}</h2>
        <ul>
          <li><strong>{translate('increased_efficiency')}</strong> {translate('increased_efficiency_description')}</li>
          <li><strong>{translate('improved_yields')}</strong> {translate('improved_yields_description')}</li>
          <li><strong>{translate('early_problem_detection')}</strong> {translate('early_problem_detection_description')}</li>
          <li><strong>{translate('reduced_labor_costs')}</strong> {translate('reduced_labor_costs_description')}</li>
          <li><strong>{translate('environmental_sustainability')}</strong> {translate('environmental_sustainability_description')}</li>
        </ul>
      </section>

      <section className="section-container">
        <h2>{translate('Future scope')}</h2>
        <h2>{translate('iot_in_home_land_farming')}</h2>
        <div className="iot-applications">
          <div className="iot-item">
            <FaSeedling className="offering-logo" />
            <h3>{translate('smart_gardens_home')}</h3>
            <p>{translate('smart_gardens_description')}</p>
          </div>
          <div className="iot-item">
            <FaPaw className="offering-logo" />
            <h3>{translate('livestock_monitoring')}</h3>
            <p>{translate('livestock_monitoring_description')}</p>
          </div>
          <div className="iot-item">
            <GiGreenhouse className="offering-logo" />
            <h3>{translate('greenhouse_automation')}</h3>
            <p>{translate('greenhouse_automation_description')}</p>
          </div>
          <div className="iot-item">
            <FaBug className="offering-logo" />
            <h3>{translate('pest_disease_management')}</h3>
            <p>{translate('pest_disease_management_description')}</p>
          </div>
          <div className="iot-item">
            <FaCloudSun className="offering-logo" />
            <h3>{translate('weather_monitoring_prediction')}</h3>
            <p>{translate('weather_monitoring_description')}</p>
          </div>
          <div className="iot-item">
            <FaMapMarkerAlt className="offering-logo" />
            <h3>{translate('asset_equipment_tracking')}</h3>
            <p>{translate('asset_equipment_description')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsAndServices;
