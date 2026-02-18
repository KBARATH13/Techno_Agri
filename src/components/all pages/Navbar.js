
import React, { useState, useContext, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { ThemeContext } from '../../App'; // Import ThemeContext
import { BsFillSunFill } from 'react-icons/bs'; // Import BsFillSunFill
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faHome, faStore, faLeaf, faStethoscope, faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import MoistureDisplay from './MoistureDisplay';

const Navbar = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage, translate } = useLanguage(); // Destructure setLanguage

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = useCallback((event) => { // Renamed and memoized
    setLanguage(event.target.value);
  }, [setLanguage]);

  const getNavItems = () => {
    const mainNavItems = [];
    const utilityNavItems = [
      <li key="language-selector" className="language-selector-container">
        <select value={language} onChange={handleLanguageChange} className="language-select">
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
        </select>
      </li>,
      <li key="theme-toggle"><button onClick={toggleTheme} className="theme-icon">{theme === 'light' ? <FontAwesomeIcon icon={faMoon} /> : <BsFillSunFill />}</button></li>
    ];

    if (token) {
      mainNavItems.push(
        <li key="home"><NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')}><FontAwesomeIcon icon={faHome} /> {translate('home')}</NavLink></li>,
        <li key="products"><NavLink to="/products-services" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')}><FontAwesomeIcon icon={faStore} /> {translate('products_services')}</NavLink></li>,
        <li key="crops"><NavLink to="/crops" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? 'active' : '')}><FontAwesomeIcon icon={faLeaf} /> {translate('crops')}</NavLink></li>,
        <li key="moisture-display"><MoistureDisplay /></li>
      );
      utilityNavItems.push(
        <li key="logout"><button onClick={handleLogout} className="btn btn-logout">{translate('logout')}</button></li>
      );
    } else {
      // Login and Register buttons removed as per instructions.
    }

    return { mainNavItems, utilityNavItems };
  };

  const { mainNavItems, utilityNavItems } = getNavItems();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/">
            TechnoAgri
          </NavLink>
        </div>
        <div className="nav-links-center">
          <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {mainNavItems}
          </ul>
        </div>
        <div className="menu-icon" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </div>
        <ul className={`nav-utility-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {utilityNavItems}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
