import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatbotModal.css';
import { useLanguage } from '../../contexts/LanguageContext';

import ReactMarkdown from 'react-markdown';

const ChatbotModal = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { language } = useLanguage();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Start the conversation with the initial greeting
            setIsLoading(true);
            axios.post('/api/chatbot/chat', { query: 'Who are you?' })
                .then(res => {
                    setMessages([{ sender: 'bot', text: res.data.response }]);
                })
                .catch(err => {
                    console.error("Error fetching initial greeting:", err);
                    setMessages([{ sender: 'bot', text: 'Sorry, I am unable to connect. Please try again later.' }]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, messages.length]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (input.trim() === '' || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chatbot/chat', { query: input });
            const botMessage = { sender: 'bot', text: response.data.response };
            setMessages(prevMessages => [...prevMessages, botMessage]);
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
        <div className="chatbot-modal-overlay">
            <div className="chatbot-modal-container">
                <div className="chatbot-modal-header">
                    <h2>{modalTitle}</h2>
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
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={inputPlaceholder}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>{sendButtonText}</button>
                </form>
            </div>
        </div>
    );
};

export default ChatbotModal;
