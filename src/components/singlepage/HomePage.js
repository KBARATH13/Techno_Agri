import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faSatelliteDish, faCubes } from '@fortawesome/free-solid-svg-icons';

const HomePage = ({ token }) => {
  const { translate } = useLanguage();



  return (
    <div className="home-page">

      <header className="hero-section">
        <div className="hero-content">
          <h1>{translate('welcome_to_smartAgri')}</h1>
          <p>{translate('solution_for_predictive_agriculture')}</p>
          {!token && (
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">{translate('login')}</Link>
              <Link to="/register" className="btn btn-secondary">{translate('register')}</Link>
            </div>
          )}

        </div>
      </header>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature modern-card">
            <FontAwesomeIcon icon={faRobot} className="feature-icon" />
            <h2>{translate('ai_powered_predictions')}</h2>
            <p>{translate('ai_predictions_description')}</p>
          </div>
          <div className="feature modern-card">
            <FontAwesomeIcon icon={faSatelliteDish} className="feature-icon" />
            <h2>{translate('iot_enabled_monitoring')}</h2>
            <p>{translate('iot_monitoring_description')}</p>
          </div>
          <div className="feature modern-card">
            <FontAwesomeIcon icon={faCubes} className="feature-icon" />
            <h2>{translate('blockchain_secured_data')}</h2>
            <p>{translate('blockchain_description')}</p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <h2>{translate('how_it_works')}</h2>
        <div className="steps">
          <div className="step modern-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>{translate('log_your_data')}</h3>
              <p>{translate('log_data_description')}</p>
            </div>
          </div>
          <div className="step modern-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>{translate('ai_analysis')}</h3>
              <p>{translate('ai_analysis_description')}</p>
            </div>
          </div>
          <div className="step modern-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>{translate('get_predictions')}</h3>
              <p>{translate('get_predictions_description')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;