const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const eventBus = require('../infrastructure/eventBus');
const events = require('../infrastructure/events');

/**
 * BalanceAgent - Maintains accurate wallet balance.
 */
class BalanceAgent {
    constructor() {
        this.initializeListeners();
    }

    initializeListeners() {
        eventBus.on(events.TRANSACTION_CREATED, (payload) => this.handleTransactionChange(payload));
        eventBus.on(events.TRANSACTION_UPDATED, (payload) => this.handleTransactionChange(payload));
        eventBus.on(events.TRANSACTION_DELETED, (payload) => this.handleTransactionChange(payload));
        eventBus.on(events.REPAYMENT_MADE, (payload) => this.handleRepayment(payload));
    }

    /**
     * Triggered when a transaction is created, updated, or deleted.
     */
    async handleTransactionChange({ userId }) {
        try {
            await this.recalculateBalance(userId);
        } catch (err) {
            console.error(`BalanceAgent error for user ${userId}:`, err.message);
        }
    }

    /**
     * Triggered when a repayment is made on an advanced payment.
     */
    async handleRepayment({ userId, amount, type }) {
        try {
            // Borrowing money (+ to wallet)
            // Lending money (- from wallet)
            // Repaying a borrow (- from wallet)
            // Getting paid back for a lend (+ to wallet)
            // The logic depends on how the user records it. 
            // In MoneyFlow, the AdvancedPayment creation should already impact balance if it's "cash".
            // Here we assume repayments are specific "wallet" movements.
            await this.recalculateBalance(userId);
        } catch (err) {
            console.error(`BalanceAgent error during repayment for user ${userId}:`, err.message);
        }
    }

    /**
     * Recalculates the entire wallet state for a user.
     */
    async recalculateBalance(userId) {
        // Simple aggregation for now. For large scale, we might use running totals.
        const summary = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
                    },
                    totalExpenses: {
                        $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
                    },
                },
            },
        ]);

        const income = summary.length > 0 ? summary[0].totalIncome : 0;
        const expenses = summary.length > 0 ? summary[0].totalExpenses : 0;
        const balance = income - expenses;

        const wallet = await Wallet.findOneAndUpdate(
            { userId },
            {
                balance,
                totalIncome: income,
                totalExpenses: expenses,
                lastUpdated: new Date(),
            },
            { upsert: true, new: true }
        );

        eventBus.emitEvent(events.BALANCE_UPDATED, { userId, balance: wallet.balance });
    }
}

module.exports = new BalanceAgent();
