/**
 * Event name constants used across agents.
 */
module.exports = {
    // TransactionAgent events
    TRANSACTION_CREATED: 'transaction:created',
    TRANSACTION_UPDATED: 'transaction:updated',
    TRANSACTION_DELETED: 'transaction:deleted',

    // BalanceAgent events
    BALANCE_UPDATED: 'balance:updated',

    // AdvancedPaymentAgent events
    REPAYMENT_MADE: 'advancedPayment:repayment',
    PAYMENT_STATUS_CHANGED: 'advancedPayment:statusChanged',

    // ReminderAgent events
    REMINDER_TRIGGERED: 'reminder:triggered',
    PAYMENT_OVERDUE: 'payment:overdue',

    // NotificationAgent events
    NOTIFICATION_CREATED: 'notification:created',

    // SyncAgent events
    SYNC_PUSH: 'sync:push',
};
