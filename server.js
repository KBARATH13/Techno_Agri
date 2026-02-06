
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const auth = require('./middleware/auth');
const runPythonScript = require('./utils/PythonRunner');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const connectDB = require('./db');
connectDB();


// --- Accurate Recommendation Logic ---






const accurateRecommendationRouter = require('./routes/accurateRecommendation');
app.use('/api/recommend', accurateRecommendationRouter);

// --- Yield Prediction Logic ---

const yieldPredictionRouter = require('./routes/yieldPrediction');
app.use('/api/yield', yieldPredictionRouter);

// --- Weather API Proxy ---



const weatherRouter = require('./routes/weather');
app.use('/api/weather', weatherRouter);

// --- Disease Detection Logic ---

// --- Disease Detection Logic ---
// --- Disease Detection Logic ---
const diseaseDetectionRouter = require('./routes/diseaseDetection');
app.use('/api/predict/disease', diseaseDetectionRouter);

// --- IoT Proxy ---
const iotRouter = require('./routes/iot');
app.use('/api/iot', iotRouter);

const chatbotRouter = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRouter);

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
