import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageSelector.css'; // We'll create this CSS file

const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();

    const handleChange = (event) => {
        setLanguage(event.target.value);
    };

    return (
        <div className="language-selector-container">
            <select value={language} onChange={handleChange} className="language-select">
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
