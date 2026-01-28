import { useEffect, useContext } from 'react';
import { ThemeContext } from '../App';

const ThemeManager = () => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return null; // This component does not render anything
};

export default ThemeManager;
