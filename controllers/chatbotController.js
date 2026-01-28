const runPythonScript = require('../utils/PythonRunner');
const path = require('path');

const chatWithBot = async (req, res) => {
    const { query, language } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    try {
        // Path to the Python chatbot script
        const scriptPath = path.join(__dirname, '..', '..', 'AI', 'predict', 'agricultural_chatbot.py');
        
        // Arguments to pass to the Python script
        // The Python script is currently set up to run predefined tests when executed directly.
        // We need to modify the Python script to accept query and language as command-line arguments
        // or modify this Node.js controller to write a temporary file for the Python script to read.
        // For now, let's assume the Python script will be modified to accept args.
        const args = [query, language || 'en']; // Default to English if language is not provided

        const result = await runPythonScript(scriptPath, args);
        
        // The Python script's main block currently runs tests and prints to stdout.
        // We need to ensure it prints a single JSON object for the API to consume.
        // For now, let's assume the Python script will be modified to output JSON.
        const pythonOutput = JSON.parse(result); // Assuming Python script outputs JSON

        res.json(pythonOutput);

    } catch (error) {
        console.error('Error calling agricultural chatbot:', error);
        res.status(500).json({ error: 'Failed to get response from chatbot.' });
    }
};

module.exports = {
    chatWithBot
};