const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        balance: { type: Number, default: 0 },
        totalIncome: { type: Number, default: 0 },
        totalExpenses: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
