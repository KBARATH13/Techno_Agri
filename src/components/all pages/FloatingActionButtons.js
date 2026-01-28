import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './FloatingActionButtons.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faChartLine } from '@fortawesome/free-solid-svg-icons';

const FloatingActionButtons = () => {
    const { translate } = useLanguage();
    const location = useLocation();

    return (
        <div className="fab-container">
            {location.pathname !== '/crop-recommendation' && (
                <Link to="/crop-recommendation" className="fab-item" title={translate('crop_recommendation')}>
                    <FontAwesomeIcon icon={faLeaf} />
                </Link>
            )}
            {location.pathname !== '/yield-prediction' && (
                <Link to="/yield-prediction" className="fab-item" title={translate('crop_yield_prediction')}>
                    <FontAwesomeIcon icon={faChartLine} />
                </Link>
            )}
        </div>
    );
};

export default FloatingActionButtons;