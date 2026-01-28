import React, { useState } from 'react';
import './CropDetailsModal.css';
import { useLanguage } from '../../contexts/LanguageContext';

const CropDetailsModal = ({ crop, onClose }) => {
  const [landSize, setLandSize] = useState(1);
  const [unit, setUnit] = useState('acre');
  const { translate } = useLanguage();

  if (!crop) return null;

  const convertToAcres = () => {
    if (unit === 'acre') return landSize;
    if (unit === 'cent') return landSize / 100;
    if (unit === 'sqft') return landSize / 43560;
    return 0;
  };

  const calculateValue = (baseValue) => {
    if (!baseValue) return 'N/A';
    const sizeInAcres = convertToAcres();
    const calculated = baseValue * sizeInAcres;
    return calculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="crop-modal-overlay" onClick={onClose}>
      <div className="crop-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{translate(crop.name)}</h2>
        <div className="crop-info-grid">
          <p><strong>{translate('time_to_grow')}:</strong> {translate(crop.timeToGrow)}</p>
          <p><strong>{translate('minimum_land_size')}:</strong> {translate(crop.minLandSize)}</p>
          <p><strong>{translate('water_needed')}:</strong> {translate(crop.waterNeeded)}</p>
          <p><strong>{translate('common_diseases')}:</strong> {translate(crop.diseases)}</p>
          <p><strong>{translate('recommended_pesticides')}:</strong> {translate(crop.pesticides)}</p>
          <p><strong>{translate('recommended_fertilizers')}:</strong> {translate(crop.fertilizers)}</p>
        </div>
        <div className="calculator">
          <h3>{translate('calculator')}</h3>
          <div className="calculator-inputs">
            <input type="number" value={landSize} onChange={e => setLandSize(parseFloat(e.target.value) || 0)} />
            <select value={unit} onChange={e => setUnit(e.target.value)}>
              <option value="acre">{translate('acre_s')}</option>
              <option value="cent">{translate('cent_s')}</option>
              <option value="sqft">{translate('square_feet')}</option>
            </select>
          </div>
          <div className="calculator-results">
            <p><strong>{translate('estimated_initial_investment')}:</strong> &#8377; {calculateValue(crop.initialInvestmentPerAcre)}</p>
            <p><strong>{translate('estimated_profit')}:</strong> &#8377; {calculateValue(crop.profitPerAcre)}</p>
            <p><strong>{translate('estimated_water_needed')}:</strong> {calculateValue(crop.waterNeededPerAcre)} {translate('cubic_meters')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetailsModal;