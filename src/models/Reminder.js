const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        advancedPaymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdvancedPayment',
            required: true,
        },
        type: {
            type: String,
            enum: ['due_soon', 'overdue'],
            required: true,
        },
        message: { type: String, required: true },
        dueDate: { type: Date, required: true },
        isProcessed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
