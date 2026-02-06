import React, { useEffect, useState } from 'react';
import './Notification.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const Notification = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    onClose();
                }
            }, 3000); // Notification disappears after 3 seconds
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [message, onClose]);

    if (!isVisible) return null;

    let icon;
    let notificationClass = 'notification-container';

    switch (type) {
        case 'error':
            icon = faTimesCircle;
            notificationClass += ' error';
            break;
        case 'success':
            icon = faCheckCircle;
            notificationClass += ' success';
            break;
        case 'info':
            icon = faInfoCircle;
            notificationClass += ' info';
            break;
        default:
            icon = faInfoCircle;
            notificationClass += ' info';
    }

    return (
        <div className={notificationClass}>
            <FontAwesomeIcon icon={icon} className="notification-icon" />
            <p>{message}</p>
            <button onClick={() => { setIsVisible(false); if (onClose) onClose(); }} className="close-button">
                &times;
            </button>
        </div>
    );
};

export default Notification;
