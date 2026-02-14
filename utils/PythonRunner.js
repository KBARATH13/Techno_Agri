const { spawn } = require('child_process');

// Helper function to run Python scripts with JSON input/output
function runPythonScript(scriptPath, data) {
    return new Promise((resolve, reject) => {
        // Use the absolute path to the correct Python executable
        const pythonExecutable = 'C:/Python313/python.exe';
        const pythonProcess = spawn(pythonExecutable, [scriptPath]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            // Always log stderr to the backend console for debugging
            if (error) {
                console.error(`Python script ${scriptPath} stderr: ${error}`);
            }

            if (code !== 0) {
                console.error(`Python script ${scriptPath} exited with code ${code}.`);
                return reject({ status: 500, error: `Failed to execute AI model.`, details: error });
            }
            try {
                const jsonResult = JSON.parse(result);
                if (jsonResult.error) {
                    return reject({ status: 500, error: jsonResult.error, details: result });
                }
                resolve(jsonResult);
            } catch (e) {
                console.error(`Error parsing JSON from ${scriptPath}: ${result}`);
                reject({ status: 500, error: 'Failed to parse AI model output.', details: result });
            }
        });

        // Write data to stdin and close it
        pythonProcess.stdin.write(JSON.stringify(data));
        pythonProcess.stdin.end();
    });
}

module.exports = runPythonScript;