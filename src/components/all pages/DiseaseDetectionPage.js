import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';

const DiseaseDetectionPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { translate } = useLanguage();

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
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">{translate('Plant Disease Detection')}</h1>
            
            <div className="card bg-base-100 shadow-xl p-6">
                <div className="flex flex-col items-center space-y-4">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="file-input file-input-bordered w-full" 
                    />

                    {preview && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">{translate('Image Preview')}</h3>
                            <img src={preview} alt="Selected" className="rounded-lg shadow-md max-w-xs h-auto" />
                        </div>
                    )}

                    <button 
                        onClick={handlePredict} 
                        className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                        disabled={loading || !selectedFile}
                    >
                        {loading ? translate('Detecting...') : translate('Detect Disease')}
                    </button>

                    {error && <p className="text-red-500 mt-4">{error}</p>}

                    {prediction && (
                        <div className="mt-6 p-4 bg-base-200 rounded-lg w-full">
                            <h3 className="text-xl font-bold text-center mb-2">{translate('Prediction Result')}</h3>
                            <div className="text-center">
                                <p className="text-lg">
                                    {translate('Detected Disease')}: 
                                    <span className="font-semibold text-primary ml-2">{prediction.disease}</span>
                                </p>
                                <p className="text-md">
                                    {translate('Confidence')}: 
                                    <span className="font-semibold ml-2">{(prediction.confidence * 100).toFixed(2)}%</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiseaseDetectionPage;
