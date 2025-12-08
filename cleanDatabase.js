require('dotenv').config();
const JobOpening = require('./src/models/JobOpening');
const { connectDatabase } = require('./src/config/database');

async function cleanDatabase() {
  try {
    // Connect to database
    await connectDatabase();
    
    console.log('🧹 Cleaning job openings database...');
    
    // Remove all existing job openings
    const result = await JobOpening.deleteMany({});
    console.log(`✅ Removed ${result.deletedCount} existing job openings`);
    
    console.log('🎉 Database cleaned successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

// Run the cleaning function
cleanDatabase();