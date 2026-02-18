const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const eventBus = require('../infrastructure/eventBus');
const events = require('../infrastructure/events');

/**
 * SyncAgent - Handles real-time synchronization via WebSockets.
 */
class SyncAgent {
    constructor() {
        this.io = null;
    }

    /**
     * Initialize Socket.IO with the HTTP server.
     */
    initialize(server) {
        this.io = socketIo(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        // Authentication middleware for Socket.IO
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded;
                next();
            } catch (err) {
                next(new Error('Authentication error: Invalid token'));
            }
        });

        this.io.on('connection', (socket) => {
            const userId = socket.user.id;
            console.log(`🔌 Client connected: ${userId} (${socket.id})`);

            // Join a private room for this user
            socket.join(userId.toString());

            socket.on('disconnect', () => {
                console.log(`🔌 Client disconnected: ${socket.id}`);
            });
        });

        this.initializeListeners();
    }

    initializeListeners() {
        // Listen for internal events and push to specific user rooms

        eventBus.on(events.BALANCE_UPDATED, ({ userId, balance }) => {
            this.pushToUser(userId, 'balance_update', { balance });
        });

        eventBus.on(events.NOTIFICATION_CREATED, (notification) => {
            this.pushToUser(notification.userId, 'new_notification', notification);
        });

        eventBus.on(events.TRANSACTION_CREATED, ({ userId, transactionId }) => {
            this.pushToUser(userId, 'sync_needed', { type: 'transaction', id: transactionId });
        });
    }

    /**
     * Push data to all connected devices of a specific user.
     */
    pushToUser(userId, event, payload) {
        if (!this.io) return;

        console.log(`🚀 Pushing [${event}] to user ${userId}`);
        this.io.to(userId.toString()).emit(event, payload);
    }
}

module.exports = new SyncAgent();
