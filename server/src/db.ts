import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

interface ConnectionOptions {
  mongoUri?: string;
  onConnected?: () => void;
  onError?: (error: Error) => void;
}

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDatabase = async (options: ConnectionOptions = {}): Promise<string> => {
  const { mongoUri, onConnected, onError } = options;
  
  let uri = mongoUri || process.env.MONGODB_URI;

  try {
    // If no URI provided, use in-memory server as fallback
    if (!uri) {
      console.log('⚠️ [Database]: No MONGODB_URI found. Starting in-memory MongoDB...');
      
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      
      console.log(`✅ [Database]: In-memory MongoDB ready at: ${uri}`);
    }

    // Connect to MongoDB
    await mongoose.connect(uri);
    
    console.log('✅ [Database]: Connected successfully to MongoDB.');
    
    // Event listeners for connection states
    mongoose.connection.on('error', (err) => {
      console.error('❌ [Database]: Connection error:', err);
      if (onError) onError(err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [Database]: Disconnected from MongoDB');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ [Database]: Reconnected to MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
      }
      console.log('🔌 [Database]: Connection closed through app termination');
      process.exit(0);
    });

    if (onConnected) onConnected();
    
    return uri;

  } catch (error) {
    console.error('❌ [Database]: Failed to connect:', error);
    if (onError) onError(error as Error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('🔌 [Database]: Disconnected successfully');
  } catch (error) {
    console.error('❌ [Database]: Error during disconnect:', error);
    throw error;
  }
};

export const getConnectionState = (): string => {
  const states: Record<number, string> = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  return states[mongoose.connection.readyState] || 'Unknown';
};
