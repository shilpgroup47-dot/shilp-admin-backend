const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    // MongoDB connection string from environment
    const uri = process.env.DATABASE_URL;
    console.log('Connecting to MongoDB...');
    
    const clientOptions = { 
      serverApi: { 
        version: '1', 
        strict: true, 
        deprecationErrors: true 
      },
      // 🚀 PERFORMANCE OPTIMIZATIONS
      maxPoolSize: 50,          // Maximum number of connections in pool
      minPoolSize: 5,           // Minimum number of connections in pool  
      maxIdleTimeMS: 30000,     // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 10000,  // How long to try selecting a server
      socketTimeoutMS: 45000,   // How long a send or receive on a socket can take
      bufferCommands: false,    // Disable mongoose buffering for commands
      autoIndex: false,         // Don't build indexes in production
      readPreference: 'secondaryPreferred'  // Read from secondary when possible
    };

    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    
    // Test the connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
  // Disconnected from MongoDB
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase
};