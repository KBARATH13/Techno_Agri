import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './YieldPrediction.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const CropYieldPredictionForm = () => {
    const [districts, setDistricts] = useState([]);
    const [crops, setCrops] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedSeason, setSelectedSeason] = useState('');
    const [cropYear, setCropYear] = useState(new Date().getFullYear());
    const [area, setArea] = useState('');
    const [areaUnit, setAreaUnit] = useState('acres');
    const [annualRainfall, setAnnualRainfall] = useState('');
    const [rainfallUnit, setRainfallUnit] = useState('cm');

    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const resultRef = useRef(null);
    const { language, translate } = useLanguage();

    useEffect(() => {
        if (prediction !== null && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [prediction]);

    const areaUnits = [{ value: 'acres', label: 'Acres' }, { value: 'hectares', label: 'Hectares' }];
    const rainfallUnits = [{ value: 'cm', label: 'cm' }, { value: 'mm', label: 'mm' }];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/yield/form-data?language=${language}`);
                setDistricts(response.data.districts.map(d => ({ value: d, label: d })));
                setCrops(response.data.crops.map(c => ({ value: c, label: c })));
                setSeasons(response.data.seasons.map(s => ({ value: s, label: s })));
            } catch (err) {
                setError(translate('failed_to_load_form_data'));
            }
        };
        fetchData();
    }, [language, translate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDistrict || !selectedCrop || !cropYear || !area || !annualRainfall || !selectedSeason) {
            setError(translate('please_fill_all_fields'));
            return;
        }
        setIsLoading(true);
        setError('');
        setPrediction(null);
        try {
            const response = await axios.post('http://localhost:5000/api/yield/predict', {
                district: selectedDistrict,
                crop: selectedCrop,
                crop_year: parseInt(cropYear),
                area: parseFloat(area),
                area_unit: areaUnit,
                annual_rainfall: parseFloat(annualRainfall),
                rainfall_unit: rainfallUnit,
                season: selectedSeason,
                language: language
            });
            setPrediction(response.data.predicted_yield_kg_per_ha);
        } catch (err) {
            setError(err.response?.data?.details || err.response?.data?.error || translate('an_error_occurred_during_prediction'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedDistrict('');
        setSelectedCrop('');
        setSelectedSeason('');
        setCropYear(new Date().getFullYear());
        setArea('');
        setAreaUnit('acres');
        setAnnualRainfall('');
        setRainfallUnit('cm');
        setPrediction(null);
        setError('');
        setIsLoading(false);
    };

    return (
        <div className="ai-tool-container">
            <div className="form-header">
                <h2>{translate('crop_yield_prediction')}</h2>
                <button type="button" onClick={handleReset} className="refresh-button" title={translate('reset_form')}>
                    <FontAwesomeIcon icon={faSyncAlt} />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="yield-form">
                <div className="form-group">
                    <label>{translate('crop')}</label>
                    <select required value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                        <option value="" disabled>{translate('select_crop')}</option>
                        {crops.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>{translate('district')}</label>
                    <select required value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedCrop}>
                        <option value="" disabled>{selectedCrop ? translate('select_district') : translate('select_crop_first')}</option>
                        {districts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    {!selectedCrop && (
                        <p className="validation-message">{translate('select_crop_first')}</p>
                    )}
                </div>
                <div className="form-group">
                    <label>{translate('season')}</label>
                    <select required value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
                        <option value="" disabled>{translate('select_season')}</option>
                        {seasons.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>{translate('crop_year')}</label>
                    <input type="number" value={cropYear} onChange={(e) => setCropYear(e.target.value)} className="year-input" required />
                </div>
                <div className="form-group unit-input-group">
                    <label>{translate('area')}</label>
                    <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="area-input" step="0.01" required />
                    <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className="unit-select">
                        {areaUnits.map(unit => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
                    </select>
                </div>
                <div className="form-group unit-input-group">
                    <label>{translate('annual_rainfall')}</label>
                    <input type="number" value={annualRainfall} onChange={(e) => setAnnualRainfall(e.target.value)} className="rainfall-input" step="0.01" required />
                    <select value={rainfallUnit} onChange={(e) => setRainfallUnit(e.target.value)} className="unit-select">
                        {rainfallUnits.map(unit => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
                    </select>
                </div>
                <button type="submit" disabled={isLoading}>{isLoading ? translate('predicting') : translate('predict_yield')}</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {prediction !== null && (
                <div ref={resultRef} className="prediction-result">
                    <h3>{translate('predicted_yield')}</h3>
                    <p>
                        {areaUnit === 'acres'
                            ? `${(prediction * 0.404686).toFixed(2)} ${translate('kg_per_acre')}`
                            : `${prediction.toFixed(2)} ${translate('kg_per_hectare')}`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CropYieldPredictionForm;