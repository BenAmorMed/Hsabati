const Notification = require('../models/Notification');
const eventBus = require('../infrastructure/eventBus');
const events = require('../infrastructure/events');

/**
 * NotificationAgent - Manages system and user notifications.
 */
class NotificationAgent {
    constructor() {
        this.initializeListeners();
        this.LOW_BALANCE_THRESHOLD = 50; // Configurable
    }

    initializeListeners() {
        eventBus.on(events.BALANCE_UPDATED, (payload) => this.checkLowBalance(payload));
        eventBus.on(events.REMINDER_TRIGGERED, (payload) => this.handleReminder(payload));
        eventBus.on(events.PAYMENT_OVERDUE, (payload) => this.handleOverduePayment(payload));
    }

    async checkLowBalance({ userId, balance }) {
        if (balance < this.LOW_BALANCE_THRESHOLD && balance >= 0) {
            await this.createNotification(userId, 'low_balance', 'Low Balance Warning', `Your current balance is ${balance}. Please check your spending.`);
        } else if (balance < 0) {
            await this.createNotification(userId, 'low_balance', 'Negative Balance Alert', `Your wallet is in negative: ${balance}. Action required.`);
        }
    }

    async handleReminder({ userId, message }) {
        await this.createNotification(userId, 'reminder', 'Payment Reminder', message);
    }

    async handleOverduePayment({ userId, personName, amount }) {
        await this.createNotification(userId, 'reminder', 'Overdue Payment', `Your payment from/to ${personName} for ${amount} is overdue.`);
    }

    async createNotification(userId, type, title, message, data = {}) {
        try {
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                data
            });

            eventBus.emitEvent(events.NOTIFICATION_CREATED, notification);

            // SyncAgent will pick this up to push via WebSocket
        } catch (err) {
            console.error('NotificationAgent create error:', err.message);
        }
    }
}

module.exports = new NotificationAgent();
