// cPanel Node.js Application Loader
// This file is required for cPanel Node.js applications to work properly

async function loadApp() {
    try {
        console.log('Loading Shilp Admin Backend Application...');
        
        // Import the main server application
        const app = require('./src/server.js');
        
        console.log('✅ Application loaded successfully');
        
        // Export the app for cPanel to use
        module.exports = app;
        
    } catch (error) {
        console.error('❌ Failed to load application:', error);
        throw error;
    }
}

// Load the application
loadApp();