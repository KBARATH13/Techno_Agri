
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import Notification from '../all pages/Notification'; // Import Notification component

const Login = ({ onLogin }) => {
    const { translate } = useLanguage();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null); // State for notification

    const { username, password } = formData;
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/users/login', formData);
            const token = res.data.token;

            // Immediate feedback and sync navigation
            onLogin(token);
            navigate('/');
        } catch (err) {
            console.error(err.response?.data || err.message);
            setNotification({ message: err.response?.data?.msg || 'Login failed', type: 'error' });
            setIsLoading(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification(null);
    };

    return (
        <div className="auth-container">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification}
                />
            )}
            {isLoading ? (
                <div className="auth-loading">
                    <div className="spinner"></div>
                    <h2>{translate('logging_in', 'Logging in...')}</h2>
                </div>
            ) : (
                <div className="auth-form">
                    <h1>{translate('login')}</h1>
                    <form onSubmit={onSubmit}>
                        <div className="input-wrapper">
                            <FontAwesomeIcon icon={faUser} className="input-icon" />
                            <input
                                type="text"
                                placeholder={translate('username_placeholder')}
                                name="username"
                                value={username}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className="input-wrapper">
                            <FontAwesomeIcon icon={faLock} className="input-icon" />
                            <input
                                type="password"
                                placeholder={translate('password_placeholder')}
                                name="password"
                                value={password}
                                onChange={onChange}
                                minLength="6"
                                required
                            />
                        </div>
                        <input type="submit" value={translate('login')} />
                    </form>
                    <p>{translate('new_to_website')} <Link to="/register">{translate('register')}</Link></p>
                </div>
            )}
        </div>
    );
};

export default Login;
