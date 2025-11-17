// cPanel compatible entry point
// This file serves as the main entry point for cPanel Node.js applications

const app = require('./src/server.js');

// Export the Express app
module.exports = app;