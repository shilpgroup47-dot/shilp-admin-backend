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