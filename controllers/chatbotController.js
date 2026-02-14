const runPythonScript = require('../utils/ChatbotRunner');
const path = require('path');

const chatWithBot = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    try {
        // Path to the new Python chatbot script
        const scriptPath = path.join(__dirname, '..', '..', 'AI', 'predict', 'rag_chatbot_cli.py');

        // Data to be sent to the Python script via stdin
        const inputData = { query };

        // runPythonScript expects the script path and the data to send
        const result = await runPythonScript(scriptPath, inputData);

        // The PythonRunner utility already parses the JSON and handles errors
        res.json(result);

    } catch (error) {
        // The PythonRunner utility rejects with a structured error, log and send it
        console.error('Error in chatbot controller:', error.details || error);
        res.status(error.status || 500).json({ error: error.error || 'Failed to get response from chatbot.' });
    }
};

module.exports = {
    chatWithBot
};
