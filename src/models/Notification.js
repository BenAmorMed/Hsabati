const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['reminder', 'low_balance', 'system', 'payment_received'],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        data: { type: Object, default: {} },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
