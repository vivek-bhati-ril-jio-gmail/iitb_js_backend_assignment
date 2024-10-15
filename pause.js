// pause.js
const { exec } = require('child_process');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runScripts = async () => {
    // Start your backend
    exec('npm start', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting backend: ${error}`);
            return;
        }
        console.log(stdout);
    });

    // Wait for a specified time (e.g., 5000 ms = 5 seconds)
    await delay(5000);

    // Now run the serve command
    exec('npm run serve', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting serve: ${error}`);
            return;
        }
        console.log(stdout);
    });
};

runScripts();