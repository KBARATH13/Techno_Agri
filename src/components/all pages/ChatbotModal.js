import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatbotModal.css';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus, faHistory, faStethoscope, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import ReactMarkdown from 'react-markdown';

const ChatbotModal = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { language, translate } = useLanguage();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load session history topics
    useEffect(() => {
        const loadSessions = async () => {
            if (isOpen) {
                try {
                    const res = await axios.get('/api/chatbot/history');
                    setSessions(res.data);

                    // If no current session, start a new one or load latest
                    if (!currentSessionId) {
                        if (res.data.length > 0) {
                            selectSession(res.data[0]._id);
                        } else {
                            startNewSession();
                        }
                    }
                } catch (err) {
                    console.error("Error loading chat history topics:", err);
                }
            }
        };
        loadSessions();
    }, [isOpen]);

    const startNewSession = () => {
        const newId = crypto.randomUUID();
        setCurrentSessionId(newId);
        setMessages([{ sender: 'bot', text: language === 'ta' ? 'வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?' : 'Hello! How can I help you today?' }]);
        setSidebarOpen(false);
    };

    const selectSession = async (sessionId) => {
        setIsLoading(true);
        setCurrentSessionId(sessionId);
        setSidebarOpen(false);
        try {
            const res = await axios.get(`/api/chatbot/history/${sessionId}`);
            const history = res.data.flatMap(msg => [
                { sender: 'user', text: msg.query },
                { sender: 'bot', text: msg.response }
            ]);
            setMessages(history);
        } catch (err) {
            console.error("Error loading session messages:", err);
            setMessages([{ sender: 'bot', text: 'Error loading this conversation.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (input.trim() === '' || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chatbot/chat', {
                query: currentInput,
                sessionId: currentSessionId
            });
            const botMessage = { sender: 'bot', text: response.data.response };
            setMessages(prevMessages => [...prevMessages, botMessage]);

            // Refresh sessions list if this was the first message
            if (messages.length <= 1) {
                const res = await axios.get('/api/chatbot/history');
                setSessions(res.data);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalTitle = language === 'ta' ? 'டெக்கிரி சாட்பாட்' : 'TechGri Chatbot';
    const inputPlaceholder = language === 'ta' ? 'ஒரு செய்தியைத் தட்டச்சு செய்க...' : 'Type a message...';
    const sendButtonText = language === 'ta' ? 'அனுப்பு' : 'Send';


    return (
        <div className="chatbot-modal-overlay" onClick={onClose}>
            <div className={`chatbot-modal-container ${isSidebarOpen ? 'sidebar-open' : ''}`} onClick={(e) => e.stopPropagation()}>

                <div className={`chatbot-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h3>{language === 'ta' ? 'அரட்டை வரலாறு' : 'Chat History'}</h3>
                        <button className="new-chat-btn" onClick={startNewSession}>
                            <FontAwesomeIcon icon={faPlus} /> {language === 'ta' ? 'புதிய அரட்டை' : 'New Chat'}
                        </button>
                    </div>
                    <div className="sidebar-content">
                        {sessions.map(session => (
                            <div
                                key={session._id}
                                className={`history-item ${currentSessionId === session._id ? 'active' : ''}`}
                                onClick={() => selectSession(session._id)}
                            >
                                <FontAwesomeIcon icon={faHistory} className="history-icon" />
                                <span className="history-topic">{session.topic || 'Untitled Chat'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chatbot-main-content">
                    <div className="chatbot-modal-header">
                        <button className="hamburger-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                        <h2>TechGri</h2>
                        <button onClick={onClose} className="chatbot-modal-close-btn">&times;</button>
                    </div>
                    <div className="chatbot-modal-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chatbot-message ${msg.sender}`}>
                                <div className="message-content">
                                    {msg.sender === 'bot' ? (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-message bot">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chatbot-modal-input-form" onSubmit={handleSend}>
                        <button
                            type="button"
                            className="disease-detection-director-btn"
                            onClick={() => { navigate('/disease-detection'); onClose(); }}
                            title={translate('disease_detection')}
                        >
                            <FontAwesomeIcon icon={faStethoscope} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={inputPlaceholder}
                            disabled={isLoading}
                        />
                        <button type="submit" className="send-btn" disabled={isLoading}>{sendButtonText}</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatbotModal;
