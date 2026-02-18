const mongoose = require('mongoose');

const partialPaymentSchema = new mongoose.Schema(
    {
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, default: Date.now },
        note: { type: String, trim: true, default: '' },
    },
    { _id: true }
);

const advancedPaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['borrow', 'lend'],
            required: true,
        },
        personName: { type: String, required: true, trim: true },
        totalAmount: { type: Number, required: true, min: 0 },
        paidAmount: { type: Number, default: 0, min: 0 },
        dueDate: { type: Date },
        status: {
            type: String,
            enum: ['pending', 'partial', 'completed'],
            default: 'pending',
        },
        description: { type: String, trim: true, default: '' },
        payments: [partialPaymentSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model('AdvancedPayment', advancedPaymentSchema);
