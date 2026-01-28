import React, { createContext, useState, useContext, useEffect } from 'react';

// Import translations
import translations from '../translations/en-ta.json';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage || 'en'; // Use saved language or default to 'en'
    });

    // Save language preference to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const translate = (key) => {
        // Fallback to English if key not found in current language, then to key itself
        return translations[key]?.[language] || translations[key]?.['en'] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, translate }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
