import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import './DiseaseDetectionPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faImage, faBrain } from '@fortawesome/free-solid-svg-icons';

const DiseaseDetectionPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { translate } = useLanguage();
    const imagePreviewRef = useRef(null); // Ref for the image preview section
    const predictionResultRef = useRef(null); // Ref for the prediction result section

    // Effect to scroll to the preview image when it appears
    useEffect(() => {
        if (preview && imagePreviewRef.current) {
            imagePreviewRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [preview]); // Dependency array ensures this runs only when 'preview' changes

    // Effect to scroll to the prediction result when it appears
    useEffect(() => {
        if (prediction && predictionResultRef.current) {
            predictionResultRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [prediction]); // Dependency array ensures this runs only when 'prediction' changes

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setPrediction(null); // Reset prediction when a new file is selected
            setError('');
        }
    };

    const handlePredict = async () => {
        if (!selectedFile) {
            setError(translate('Please select an image file first.'));
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        setLoading(true);
        setError('');
        setPrediction(null);

        try {
            const response = await axios.post('/api/predict/disease/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPrediction(response.data);
        } catch (err) {
            setError(translate('An error occurred during prediction. Please try again.'));
            console.error('Prediction error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="disease-detection-page">
            <h1>{translate('Plant Disease Detection')}</h1>
            <div className="detection-card">
                <div className="upload-section">
                    <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                    <label htmlFor="file-upload" className="file-input-label">
                        {translate('Choose Image')}
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                    <p>{selectedFile ? selectedFile.name : translate('No file chosen')}</p>
                </div>

                {preview && (
                    <div className="image-preview-section" ref={imagePreviewRef}>
                        <h3>{translate('Image Preview')}</h3>
                        <img src={preview} alt="Selected" className="image-preview" />
                    </div>
                )}

                <button 
                    onClick={handlePredict} 
                    className="predict-button"
                    disabled={loading || !selectedFile}
                >
                    <FontAwesomeIcon icon={faBrain} />
                    <span>{loading ? translate('Detecting...') : translate('Detect Disease')}</span>
                </button>

                {loading && <div className="loading-spinner"></div>}

                {error && <p className="error-message">{error}</p>}

                {prediction && (
                    <div className="prediction-result-card" ref={predictionResultRef}>
                        <h3>{translate('Prediction Result')}</h3>
                        <div className="result-item">
                            <span className="label">{translate('Detected Disease')}:</span>
                            <span className="value">
                                {prediction.disease === 'healthy' ? translate('No disease detected') : prediction.disease}
                            </span>
                        </div>
                        <div className="result-item">
                            <span className="label">{translate('Confidence')}:</span>
                            <span className="value">{(prediction.confidence * 100).toFixed(2)}%</span>
                        </div>
                        <div className="confidence-bar-container">
                            <div 
                                className="confidence-bar" 
                                style={{ width: `${(prediction.confidence * 100).toFixed(2)}%` }}
                            >
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseDetectionPage;
