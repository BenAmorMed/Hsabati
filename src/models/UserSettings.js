const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        currency: { type: String, default: 'USD' },
        language: { type: String, default: 'en' },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        notifications: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);
