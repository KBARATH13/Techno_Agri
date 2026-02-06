
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Notification from '../all pages/Notification'; // Import Notification component

const Login = ({ onLogin }) => {
    const { translate } = useLanguage();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [notification, setNotification] = useState(null); // State for notification

    const { email, password } = formData;
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/users/login', formData);
            onLogin(res.data.token); // Call the onLogin function from App.js
            navigate('/');
        } catch (err) {
            console.error(err.response.data);
            setNotification({ message: err.response.data.msg || 'Login failed', type: 'error' });
        }
    };

    const handleCloseNotification = () => {
        setNotification(null);
    };

    return (
        <div className="login-container">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification}
                />
            )}
            <div className="login-form">
                <h1>{translate('login')}</h1>
                <form onSubmit={onSubmit}>
                    <div className="input-wrapper">
                        <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                        <input
                            type="email"
                            placeholder={translate('email_address_placeholder')}
                            name="email"
                            value={email}
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
        </div>
    );
};

export default Login;
