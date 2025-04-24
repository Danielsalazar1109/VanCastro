import connectToDatabase from './mongodb';
import mongoose from 'mongoose';

async function testMongoDBConnection() {
  console.log('Testing MongoDB connection...');
  
  try {
    // Attempt to connect to the database
    const conn = await connectToDatabase();
    
    if (conn) {
      console.log('✅ Successfully connected to MongoDB');
      
      // Get connection status
      const state = mongoose.connection.readyState;
      const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      console.log(`Connection state: ${stateMap[state as keyof typeof stateMap]} (${state})`);
      
      // Get database information
      const db = mongoose.connection.db;
      if (db) {
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
        
        // Count documents in User collection if it exists
        if (collections.some(c => c.name === 'users')) {
          const userCount = await db.collection('users').countDocuments();
          console.log(`Number of users in database: ${userCount}`);
        }
      }
      
      console.log('MongoDB connection test completed successfully');
    } else {
      console.error('❌ Failed to connect to MongoDB: Connection returned null');
    }
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
    
    // Exit the process
    process.exit(0);
  }
}

// Run the test
testMongoDBConnection();