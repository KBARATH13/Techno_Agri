const { spawn } = require('child_process');

// Helper function to run Python chatbot script
function runChatbotScript(scriptPath, data) {
    return new Promise((resolve, reject) => {
        // Use the absolute path to the correct Python executable
        // Using the same environment as other models for now, but isolated in this file
        const pythonExecutable = 'C:/Python313/python.exe';

        // Spawn the python process
        const pythonProcess = spawn(pythonExecutable, [scriptPath]);

        let result = '';
        let error = '';

        // Collect data from stdout
        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        // Collect data from stderr
        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });



        pythonProcess.on('close', (code) => {
            // Log stderr for debugging purposes, as it might contain warnings
            if (error) {
                console.warn(`Chatbot script stderr: ${error}`);
            }

            if (code !== 0) {
                console.error(`Chatbot script exited with code ${code}.`);
                return reject({ status: 500, error: `Failed to execute Chatbot model.`, details: error });
            }

            try {
                // Attempt to find JSON in the output
                // Only parse the last line or find the JSON structure if there's mixed output
                // For now, we assume the script prints ONLY valid JSON at the end
                // or we can try to filter for the JSON part if needed in future
                const jsonResult = JSON.parse(result);

                if (jsonResult.response) {
                    resolve(jsonResult);
                } else if (jsonResult.error) {
                    return reject({ status: 500, error: jsonResult.error, details: result });
                } else {
                    resolve(jsonResult);
                }
            } catch (e) {
                console.error(`Error parsing JSON from chatbot script: ${result}`);
                reject({ status: 500, error: 'Failed to parse Chatbot model output.', details: result });
            }
        });

        // Write data to stdin and close it
        pythonProcess.stdin.write(JSON.stringify(data));
        pythonProcess.stdin.end();
    });
}

module.exports = runChatbotScript;
