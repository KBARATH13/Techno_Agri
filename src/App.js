import React, { useState, useEffect, createContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/all pages/Navbar';
import HomePage from './components/singlepage/HomePage';
import CropsPage from './components/singlepage/CropsPage';
import ClimateWidget from './components/all pages/ClimateWidget';
import Login from './components/entry pages/Login';
import Registration from './components/entry pages/Registration';
import ProtectedRoute from './utils/ProtectedRoute';
import ProductsAndServices from './components/singlepage/ProductsAndServices';
import CropRecommendation from './components/CPR/CropRecommendation';
import YieldPrediction from './components/CPR/YieldPrediction';
import DiseaseDetectionPage from './components/all pages/DiseaseDetectionPage';
import FloatingActionButtons from './components/all pages/FloatingActionButtons';
import ChatbotModal from './components/all pages/ChatbotModal'; // Import ChatbotModal
import setAuthToken from './utils/setAuthToken';
import ThemeManager from './utils/ThemeManager';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import axios from 'axios'; // Import axios

// Create Theme Context
export const ThemeContext = createContext(null);

// Main App content to get access to navigation hooks
const AppContent = ({ token, username, onLogin, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const { translate } = useLanguage();
  const [isChatbotOpen, setChatbotOpen] = useState(false); // State for chatbot modal

  // Add Axios interceptor for 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid, log out the user
          onLogout();
          navigate('/login'); // Redirect to login page
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on component unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [onLogout, navigate]); // Depend on onLogout and navigate

  return (
    <div className="App">
      <Navbar token={token} onLogout={onLogout} />
      {token && <ClimateWidget />}
      <Routes>
        <Route path="/" element={<HomePage token={token} username={username} />} />
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/crops" element={<ProtectedRoute><CropsPage /></ProtectedRoute>} />
        <Route path="/products-services" element={<ProtectedRoute><ProductsAndServices /></ProtectedRoute>} />
        <Route path="/crop-recommendation" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
        <Route path="/yield-prediction" element={<ProtectedRoute><YieldPrediction /></ProtectedRoute>} />
        <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetectionPage /></ProtectedRoute>} />
      </Routes>
      {token && <FloatingActionButtons onOpenChatbot={() => setChatbotOpen(true)} />}
      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
};


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme; // Use saved theme if it exists
    }
    // If no theme is saved, use system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null); // Clear token if it's null
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  };

  // Proactively verify user existence on mount/token change
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          await axios.get('http://localhost:5000/users/');
        } catch (err) {
          console.warn("User verification failed, logging out.");
          // Interceptor will handle the 401 and call onLogout but we can be safe
          if (err.response && err.response.status === 401) {
            handleLogout();
          }
        }
      }
    };
    verifyUser();
  }, [token]);

  const handleLogin = (newToken, newUsername) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const toggleTheme = () => {
    setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <ThemeManager />
        <LanguageProvider>
          <AppContent token={token} username={username} onLogin={handleLogin} onLogout={handleLogout} />
        </LanguageProvider>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
