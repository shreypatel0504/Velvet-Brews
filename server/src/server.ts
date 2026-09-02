import { httpServer } from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
  });

  connectDB().catch((err) => {
    console.warn('⚠️ MongoDB connection notice:', err?.message || err);
  });
};

startServer();
