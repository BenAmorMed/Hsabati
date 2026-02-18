const Transaction = require('../models/Transaction');

/**
 * GET /analytics/summary
 * Monthly breakdown of income, expense, and net for the current user.
 */
const summary = async (req, res, next) => {
    try {
        const { year } = req.query;
        const matchYear = year ? parseInt(year) : new Date().getFullYear();

        const data = await Transaction.aggregate([
            {
                $match: {
                    userId: req.userObjectId,
                    date: {
                        $gte: new Date(`${matchYear}-01-01`),
                        $lte: new Date(`${matchYear}-12-31T23:59:59.999Z`),
                    },
                },
            },
            {
                $group: {
                    _id: { month: { $month: '$date' } },
                    income: {
                        $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
                    },
                    expense: {
                        $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
                    },
                },
            },
            { $sort: { '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    income: 1,
                    expense: 1,
                    net: { $subtract: ['$income', '$expense'] },
                },
            },
        ]);

        res.json({ year: matchYear, months: data });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /analytics/categories
 * Distribution of expenses grouped by category.
 */
const categories = async (req, res, next) => {
    try {
        const { type = 'expense' } = req.query;

        const data = await Transaction.aggregate([
            { $match: { userId: req.userObjectId, type } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    total: 1,
                    count: 1,
                },
            },
        ]);

        res.json(data);
    } catch (err) {
        next(err);
    }
};

module.exports = { summary, categories };
