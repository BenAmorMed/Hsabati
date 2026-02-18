const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const eventBus = require('../infrastructure/eventBus');
const events = require('../infrastructure/events');

// Validation
const createRules = [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
];

/**
 * POST /transactions
 */
const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const transaction = await Transaction.create({
            ...req.body,
            userId: req.user.id,
        });

        eventBus.emitEvent(events.TRANSACTION_CREATED, {
            userId: req.user.id,
            transactionId: transaction._id,
            type: transaction.type,
            amount: transaction.amount,
        });

        res.status(201).json(transaction);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /transactions
 */
const list = async (req, res, next) => {
    try {
        const { type, category, startDate, endDate, page = 1, limit = 20 } = req.query;
        const filter = { userId: req.user.id };

        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(filter),
        ]);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /transactions/:id
 */
const getById = async (req, res, next) => {
    try {
        const tx = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!tx) return res.status(404).json({ message: 'Transaction not found' });
        res.json(tx);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /transactions/:id
 */
const update = async (req, res, next) => {
    try {
        const tx = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!tx) return res.status(404).json({ message: 'Transaction not found' });

        eventBus.emitEvent(events.TRANSACTION_UPDATED, {
            userId: req.user.id,
            transactionId: tx._id,
        });

        res.json(tx);
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /transactions/:id
 */
const remove = async (req, res, next) => {
    try {
        const tx = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!tx) return res.status(404).json({ message: 'Transaction not found' });

        eventBus.emitEvent(events.TRANSACTION_DELETED, {
            userId: req.user.id,
            transactionId: req.params.id,
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

module.exports = { create, list, getById, update, remove, createRules };
