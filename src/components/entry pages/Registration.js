
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Registration.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const Registration = () => {
    const { translate } = useLanguage();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const { username, email, password } = formData;
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/users/register', formData);
            navigate('/login');
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-form">
                <h1>{translate('register')}</h1>
                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faUser} />
                        <input
                            type="text"
                            placeholder={translate('username_placeholder')}
                            name="username"
                            value={username}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <input
                            type="email"
                            placeholder={translate('email_address_placeholder')}
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faLock} />
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
                    <input type="submit" value={translate('register')} />
                </form>
                <p>{translate('already_registered')} <Link to="/login">{translate('login')}</Link></p>
            </div>
        </div>
    );
};

export default Registration;
