const cron = require('node-cron');
const AdvancedPayment = require('../models/AdvancedPayment');
const Reminder = require('../models/Reminder');
const eventBus = require('../infrastructure/eventBus');
const events = require('../infrastructure/events');

/**
 * ReminderAgent - Monitors due dates and triggers alerts.
 */
class ReminderAgent {
    constructor() {
        this.startCron();
    }

    /**
     * Daily check for due dates at midnight.
     */
    startCron() {
        // Run every day at 00:00
        cron.schedule('0 0 * * *', () => {
            console.log('⏰ ReminderAgent: Starting daily scan of due dates...');
            this.scanDueDates();
        });
    }

    async scanDueDates() {
        try {
            const today = new Date();
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(today.getDate() + 3);

            // 1. Find payments due in the next 3 days that haven't been reminded yet
            const upcoming = await AdvancedPayment.find({
                status: { $ne: 'completed' },
                dueDate: { $lte: threeDaysFromNow, $gt: today }
            });

            for (const payment of upcoming) {
                const existing = await Reminder.findOne({
                    advancedPaymentId: payment._id,
                    type: 'due_soon'
                });

                if (!existing) {
                    await this.triggerReminder(payment, 'due_soon');
                }
            }

            // 2. Find overdue payments
            const overdue = await AdvancedPayment.find({
                status: { $ne: 'completed' },
                dueDate: { $lt: today }
            });

            for (const payment of overdue) {
                const existing = await Reminder.findOne({
                    advancedPaymentId: payment._id,
                    type: 'overdue'
                });

                if (!existing) {
                    await this.triggerReminder(payment, 'overdue');
                    eventBus.emitEvent(events.PAYMENT_OVERDUE, {
                        userId: payment.userId,
                        personName: payment.personName,
                        amount: payment.totalAmount - payment.paidAmount
                    });
                }
            }

        } catch (err) {
            console.error('ReminderAgent scan error:', err.message);
        }
    }

    async triggerReminder(payment, type) {
        const message = type === 'due_soon'
            ? `Payment of ${payment.totalAmount} to/from ${payment.personName} is due soon (${payment.dueDate.toLocaleDateString()}).`
            : `Payment of ${payment.totalAmount} to/from ${payment.personName} was due on ${payment.dueDate.toLocaleDateString()} and is now OVERDUE.`;

        await Reminder.create({
            userId: payment.userId,
            advancedPaymentId: payment._id,
            type,
            message,
            dueDate: payment.dueDate
        });

        eventBus.emitEvent(events.REMINDER_TRIGGERED, {
            userId: payment.userId,
            message,
            paymentId: payment._id
        });
    }
}

module.exports = new ReminderAgent();
