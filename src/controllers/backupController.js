const Transaction = require('../models/Transaction');
const AdvancedPayment = require('../models/AdvancedPayment');
const UserSettings = require('../models/UserSettings');

/**
 * GET /backup/export
 * Export all user data as a single JSON object.
 */
const exportData = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [transactions, advancedPayments, settings] = await Promise.all([
            Transaction.find({ userId }).lean(),
            AdvancedPayment.find({ userId }).lean(),
            UserSettings.findOne({ userId }).lean(),
        ]);

        res.json({
            exportedAt: new Date().toISOString(),
            data: { transactions, advancedPayments, settings },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /backup/import
 * Import a previously exported JSON backup.
 */
const importData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ message: 'Missing "data" field in request body' });
        }

        const results = { transactions: 0, advancedPayments: 0, settings: false };

        // Import transactions
        if (Array.isArray(data.transactions) && data.transactions.length) {
            const docs = data.transactions.map(({ _id, userId: _u, ...rest }) => ({
                ...rest,
                userId,
            }));
            const inserted = await Transaction.insertMany(docs, { ordered: false });
            results.transactions = inserted.length;
        }

        // Import advanced payments
        if (Array.isArray(data.advancedPayments) && data.advancedPayments.length) {
            const docs = data.advancedPayments.map(({ _id, userId: _u, ...rest }) => ({
                ...rest,
                userId,
            }));
            const inserted = await AdvancedPayment.insertMany(docs, { ordered: false });
            results.advancedPayments = inserted.length;
        }

        // Import settings (upsert)
        if (data.settings) {
            const { _id, userId: _u, ...settingsData } = data.settings;
            await UserSettings.findOneAndUpdate({ userId }, settingsData, {
                upsert: true,
                new: true,
            });
            results.settings = true;
        }

        res.json({ message: 'Import complete', results });
    } catch (err) {
        next(err);
    }
};

module.exports = { exportData, importData };
