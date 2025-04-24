import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  console.log('Testing MongoDB connection...');
  
  let connectionStatus = {
    success: false,
    state: '',
    collections: [] as string[],
    userCount: 0,
    error: ''
  };
  
  try {
    // Attempt to connect to the database
    const conn = await connectToDatabase();
    
    if (conn) {
      console.log('✅ Successfully connected to MongoDB');
      connectionStatus.success = true;
      
      // Get connection state
      const state = mongoose.connection.readyState;
      const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      connectionStatus.state = `${stateMap[state as keyof typeof stateMap]} (${state})`;
      console.log(`Connection state: ${connectionStatus.state}`);
      
      // Get database information
      const db = mongoose.connection.db;
      if (db) {
        // List collections
        const collections = await db.listCollections().toArray();
        connectionStatus.collections = collections.map(c => c.name);
        console.log(`Available collections: ${connectionStatus.collections.join(', ')}`);
        
        // Count documents in User collection if it exists
        if (collections.some(c => c.name === 'users')) {
          connectionStatus.userCount = await db.collection('users').countDocuments();
          console.log(`Number of users in database: ${connectionStatus.userCount}`);
        }
      }
      
      console.log('MongoDB connection test completed successfully');
    } else {
      console.error('❌ Failed to connect to MongoDB: Connection returned null');
      connectionStatus.error = 'Connection returned null';
    }
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    connectionStatus.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  // We don't close the connection here since Next.js manages connections
  
  return NextResponse.json(connectionStatus);
}