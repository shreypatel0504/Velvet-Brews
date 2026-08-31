import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import reservationRoutes from './routes/reservationRoutes';
import reviewRoutes from './routes/reviewRoutes';
import staffRoutes from './routes/staffRoutes';
import contactRoutes from './routes/contactRoutes';
import activityRoutes from './routes/activityRoutes';
import notificationRoutes, { currentActiveOffer as initialActiveOffer } from './routes/notificationRoutes';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Velvet Brews Cafe Management API is running.');
});

app.get('/api/health', (req, res) => {
  const isConnected = require('mongoose').connection.readyState === 1;
  res.json({
    status: 'ok',
    database: isConnected ? 'connected' : 'disconnected',
    mongoHost: isConnected ? require('mongoose').connection.host : null,
    mongoDbName: isConnected ? require('mongoose').connection.name : null,
    timestamp: new Date().toISOString()
  });
});

// Active offer in memory
let currentActiveOffer: any = initialActiveOffer;

// Socket.io — relay all events between customer website and admin portal
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current active offer to newly connected client if available
  if (currentActiveOffer) {
    socket.emit('new-offer-broadcast', currentActiveOffer);
  }

  // Live Offer Broadcasts (Admin -> All Customers)
  socket.on('broadcast-offer', (data) => {
    console.log('📢 Live Offer Broadcasted:', data);
    currentActiveOffer = { ...data, timestamp: new Date().toISOString() };
    io.emit('new-offer-broadcast', currentActiveOffer);
  });

  socket.on('clear-offer', () => {
    console.log('🛑 Offer Cleared');
    currentActiveOffer = null;
    io.emit('offer-cleared');
  });

  // Orders
  socket.on('new-order', (data) => {
    io.emit('new-order', data);
  });
  socket.on('order-updated', (data) => {
    io.emit('order-updated', data);
  });

  // Reservations
  socket.on('new-reservation', (data) => {
    io.emit('new-reservation', data);
  });
  socket.on('reservation-updated', (data) => {
    io.emit('reservation-updated', data);
  });

  // Menu (admin changes → website refreshes live)
  socket.on('menu-updated', (data) => {
    io.emit('menu-updated', data);
  });

  // Reviews & Feedback (customer posts → admin sees it live)
  socket.on('new-review', (data) => {
    io.emit('new-review', data);
  });
  socket.on('new-feedback', (data) => {
    io.emit('new-feedback', data);
  });
  socket.on('review-deleted', (data) => {
    io.emit('review-deleted', data);
  });

  // Contact Inquiries & Subscribers
  socket.on('new-contact', (data) => {
    io.emit('new-contact', data);
  });
  socket.on('contact-updated', (data) => {
    io.emit('contact-updated', data);
  });
  socket.on('new-subscriber', (data) => {
    io.emit('new-subscriber', data);
  });

  // Live User Activity Stream (Surveillance)
  socket.on('user-activity', (data) => {
    io.emit('user-activity', data);
  });

  // Staff events
  socket.on('staff-added', (data) => {
    io.emit('staff-added', data);
  });
  socket.on('staff-updated', (data) => {
    io.emit('staff-updated', data);
  });
  socket.on('staff-deleted', (data) => {
    io.emit('staff-deleted', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export { app, httpServer, io };

