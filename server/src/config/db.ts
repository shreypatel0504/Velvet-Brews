import mongoose from 'mongoose';
import { syncUsersToMongoDB } from '../controllers/authController';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host}, DB: ${conn.connection.name}`);
    // Sync any registered users to MongoDB
    await syncUsersToMongoDB();
    return conn;
  } catch (error: any) {
    console.error(`❌ [MongoDB Connection Failed] Could not connect to: ${uri}`);
    console.error(`   Error message: ${error.message}`);
    console.warn(`
👉 If using Local MongoDB: Ensure MongoDB Service is running ('net start MongoDB' or run 'mongod').
👉 If using MongoDB Atlas: Set MONGODB_URI in 'server/.env' (e.g. mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cafe-db).
`);
  }
};

