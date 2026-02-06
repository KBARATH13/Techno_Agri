import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CropRecommendation.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMapMarkedAlt, faSyncAlt, faVial, faSeedling, faFlask, faAtom, 
    faThermometerHalf, faTint, faCloudShowersHeavy, faMountain
} from '@fortawesome/free-solid-svg-icons';
import recommendationsData from '../../translations/recommendations.json';

// Icon mapping for the accurate form
const accurateFormIcons = {
    N: faSeedling,
    P: faFlask,
    K: faAtom,
    temperature: faThermometerHalf,
    humidity: faTint,
    ph: faVial,
    rainfall: faCloudShowersHeavy,
    refresh: faSyncAlt
};

const CropRecommendation = () => {
    const { language, translate } = useLanguage();
    const [expanded, setExpanded] = useState(null);

    // 1. Add a ref for the main container
    const menuContainerRef = useRef(null);

    // --- State for General Recommendation ---
    const [districtOptions, setDistrictOptions] = useState([]);
    const [soilOptions, setSoilOptions] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSoil, setSelectedSoil] = useState('');
    const [generalRecommendation, setGeneralRecommendation] = useState([]);
    const [isGeneralLoading, setGeneralLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const generalResultRef = useRef(null);

    // --- State for Accurate Recommendation ---
    const [accurateFormData, setAccurateFormData] = useState({
        N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: ''
    });
    const [accurateRecommendation, setAccurateRecommendation] = useState('');
    const [isAccurateLoading, setAccurateLoading] = useState(false);
    const [accurateError, setAccurateError] = useState('');
    const accurateResultRef = useRef(null);

    // --- Effect for General Recommendation Data Population ---
    useEffect(() => {
        // Populate districts when the component loads or language changes
        const districts = Object.keys(recommendationsData).map(districtEn => ({
            value: districtEn,
            label: language === 'ta' ? recommendationsData[districtEn].ta : districtEn
        }));
        setDistrictOptions(districts);

        // If a district is already selected, update its soil options
        if (selectedDistrict) {
            const soils = recommendationsData[selectedDistrict]?.soils;
            if (soils) {
                const soilOpts = Object.keys(soils).map(soilEn => ({
                    value: soilEn,
                    label: language === 'ta' ? soils[soilEn].ta : soilEn
                }));
                setSoilOptions(soilOpts);
            }
        }
    }, [language, selectedDistrict]);
    
    // --- Effects for scrolling to results ---
    useEffect(() => {
        if (generalRecommendation.length > 0 && generalResultRef.current) {
            generalResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [generalRecommendation]);

    useEffect(() => {
        if (accurateRecommendation && accurateResultRef.current) {
            accurateResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [accurateRecommendation]);

    // Effect for handling clicks outside the menu container
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuContainerRef.current && !menuContainerRef.current.contains(event.target)) {
                // Clicked outside the menu container, so close any expanded panel
                setExpanded(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuContainerRef, setExpanded]); // Dependencies: menuContainerRef and setExpanded

    // --- Handlers ---
    const handlePanelClick = (panel) => {
        setExpanded(prev => prev === panel ? null : panel);
    };

    // --- Handlers for General Recommendation ---
    const handleDistrictChange = (districtValue) => {
        setSelectedDistrict(districtValue);
        setSelectedSoil('');
        setGeneralRecommendation([]);
        setSoilOptions([]); // Clear previous soil options

        const soils = recommendationsData[districtValue]?.soils;
        if (soils) {
            const soilOpts = Object.keys(soils).map(soilEn => ({
                value: soilEn,
                label: language === 'ta' ? soils[soilEn].ta : soilEn
            }));
            setSoilOptions(soilOpts);
        }
    };

    const handleGeneralSubmit = (e) => {
        e.preventDefault();
        if (!selectedDistrict || !selectedSoil) {
            setGeneralError(translate('select_district_and_soil'));
            return;
        }
        setGeneralError('');
        
        const crops = recommendationsData[selectedDistrict]?.soils[selectedSoil]?.crops || [];
        setGeneralRecommendation(crops);
    };

    const clearGeneralForm = () => {
        setSelectedDistrict('');
        setSelectedSoil('');
        setGeneralRecommendation([]);
        setGeneralError('');
        setSoilOptions([]);
    };

    // --- Handlers for Accurate Recommendation ---
    const handleAccurateFormChange = (e) => {
        const { name, value } = e.target;
        setAccurateFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAccurateSubmit = async (e) => {
        e.preventDefault();
        setAccurateLoading(true);
        setAccurateError('');
        setAccurateRecommendation('');
        try {
            const payload = { ...accurateFormData, language };
            const response = await axios.post('http://localhost:5000/api/recommend/accurate', payload);
            setAccurateRecommendation(response.data.recommended_crop);
        } catch (err) {
            setAccurateError(err.response?.data?.error || translate('an_error_occurred'));
        } finally {
            setAccurateLoading(false);
        }
    };

    const clearAccurateForm = () => {
        setAccurateFormData({
            N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: ''
        });
        setAccurateRecommendation('');
        setAccurateError('');
    };

    const getPanelClassName = (panelType) => {
        if (!expanded) return 'menu-option';
        return expanded === panelType ? 'menu-option expanded' : 'menu-option contracted';
    };

    return (
        <div className="crop-recommendation-page">
            <div className="recommendation-menu-container" ref={menuContainerRef}>
                <h1>{translate('Crop Recommendation')}</h1>
                <p>{translate('choose_recommendation_type')}</p>
                <div className="menu-options">
                    {/* General Recommendation Panel */}
                    <div className={getPanelClassName('general')} onClick={() => expanded !== 'general' && handlePanelClick('general')}>
                        <div className="option-header">
                            <div className="option-icon"><FontAwesomeIcon icon={faMapMarkedAlt} /></div>
                            <div className="option-text">
                                <h3>{translate('general_recommendation')}</h3>
                                <p>{translate('general_recommendation_description')}</p>
                            </div>
                            {expanded === 'general' && (
                                <button onClick={clearGeneralForm} className="refresh-button" title={translate('reset_form')}>
                                    <FontAwesomeIcon icon={faSyncAlt} />
                                </button>
                            )}
                        </div>


                        {expanded === 'general' && (
                            <div className="option-content" onClick={(e) => e.stopPropagation()}>
                                <form onSubmit={handleGeneralSubmit}>
                                    <div className="form-group">
                                        <label>{translate('district')}</label>
                                                    
                                        <div  className="input-group">
                                            
                                            <select required value={selectedDistrict} onChange={(e) => handleDistrictChange(e.target.value)}>
                                                <option value="" disabled>{translate('select_district')}</option>
                                                {districtOptions.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>{translate('soil_type')}</label>
                                        <div className="input-group">
                                            <select required value={selectedSoil} onChange={(e) => setSelectedSoil(e.target.value)} disabled={!selectedDistrict}>
                                                <option value="" disabled>{translate('select_soil_type')}</option>
                                                {soilOptions.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isGeneralLoading}>{isGeneralLoading ? translate('loading') : translate('get_recommendation')}</button>
                                </form>
                                {generalError && <p className="error-message">{generalError}</p>}
                                {generalRecommendation.length > 0 && (
                                    <div ref={generalResultRef} className="recommendation-results">
                                        <h3>{translate('recommended_crops')}</h3>
                                        <ul>{generalRecommendation.map((crop, index) => <li key={index}>{crop[language]}</li>)}</ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Accurate Recommendation Panel */}
                    <div className={getPanelClassName('accurate')} onClick={() => expanded !== 'accurate' && handlePanelClick('accurate')}>
                        <div className="option-header">
                            <div className="option-icon"><FontAwesomeIcon icon={faVial} /></div>
                            <div className="option-text">
                                <h3>{translate('accurate_recommendation')}</h3>
                                <p>{translate('accurate_recommendation_description')}</p>
                            </div>
                            {expanded === 'accurate' && (
                                <button onClick={clearAccurateForm} className="refresh-button" title={translate('reset_form')}>
                                    <FontAwesomeIcon icon={faSyncAlt} />
                                </button>
                            )}
                        </div>
                        {expanded === 'accurate' && (
                            <div className="option-content" onClick={(e) => e.stopPropagation()}>
                                <form onSubmit={handleAccurateSubmit} className="accurate-form">
                                    {Object.keys(accurateFormData).map(key => (
                                        <div className="form-group" key={key}>
                                            <label>{translate(key)}</label>
                                            <div className="input-with-icon">
                                                <FontAwesomeIcon icon={accurateFormIcons[key]} />
                                                <input type="number" name={key} value={accurateFormData[key]} onChange={handleAccurateFormChange} required />
                                            </div>
                                        </div>
                                    ))}
                                    <button type="submit" disabled={isAccurateLoading}>{isAccurateLoading ? translate('loading') : translate('get_accurate_recommendation')}</button>
                                </form>
                                {accurateError && <p className="error-message">{accurateError}</p>}
                                {accurateRecommendation && (
                                    <div ref={accurateResultRef} className="recommendation-results">
                                        <h3>{translate('recommended_crop')}</h3>
                                        <p className="accurate-result">{accurateRecommendation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropRecommendation;