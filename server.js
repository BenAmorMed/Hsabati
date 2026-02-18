require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Agent imports
const syncAgent = require('./src/agents/syncAgent');
require('./src/agents/balanceAgent'); // Initialize listeners
require('./src/agents/notificationAgent'); // Initialize listeners
require('./src/agents/reminderAgent'); // Initialize cron

// Route imports
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const transactionRoutes = require('./src/routes/transactions');
const advancedPaymentRoutes = require('./src/routes/advancedPayment');
const analyticsRoutes = require('./src/routes/analytics');
const backupRoutes = require('./src/routes/backup');
const notificationRoutes = require('./src/routes/notifications');

const app = express();
const server = http.createServer(app);

// --------------- Middleware ---------------
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --------------- Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/advanced-payment', advancedPaymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/notifications', notificationRoutes);

// Health-check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', agents: 'all active' }));

// --------------- Error handler ---------------
app.use(errorHandler);

// --------------- Start ---------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // Initialize Socket.IO via SyncAgent
  syncAgent.initialize(server);

  server.listen(PORT, () => console.log(`🚀 MoneyFlow SaaS Server running on port ${PORT}`));
});
