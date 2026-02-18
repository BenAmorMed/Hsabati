const { body, validationResult } = require('express-validator');
const AdvancedPayment = require('../models/AdvancedPayment');
const eventBus = require('../infrastructure/eventBus');
const events = require('../infrastructure/events');

// Validation
const createRules = [
    body('type').isIn(['borrow', 'lend']).withMessage('Type must be borrow or lend'),
    body('personName').trim().notEmpty().withMessage('Person name is required'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
];

const partialPaymentRules = [
    body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
];

/**
 * POST /advanced-payment
 */
const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const payment = await AdvancedPayment.create({
            ...req.body,
            userId: req.user.id,
        });

        // If it's a cash transaction (borrow/lend), it could impact balance immediately.
        // For simplicity, let's treat repayments as the primary balance impact.

        res.status(201).json(payment);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /advanced-payment
 */
const list = async (req, res, next) => {
    try {
        const { type, status } = req.query;
        const filter = { userId: req.user.id };
        if (type) filter.type = type;
        if (status) filter.status = status;

        const payments = await AdvancedPayment.find(filter).sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /advanced-payment/:id
 */
const getById = async (req, res, next) => {
    try {
        const payment = await AdvancedPayment.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!payment) return res.status(404).json({ message: 'Advanced payment not found' });
        res.json(payment);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /advanced-payment/:id
 */
const update = async (req, res, next) => {
    try {
        const allowed = ['personName', 'totalAmount', 'dueDate', 'description', 'type'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const payment = await AdvancedPayment.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            updates,
            { new: true, runValidators: true }
        );
        if (!payment) return res.status(404).json({ message: 'Advanced payment not found' });
        res.json(payment);
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /advanced-payment/:id
 */
const remove = async (req, res, next) => {
    try {
        const payment = await AdvancedPayment.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!payment) return res.status(404).json({ message: 'Advanced payment not found' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /advanced-payment/:id/payment   (add partial payment)
 */
const addPartialPayment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const payment = await AdvancedPayment.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!payment) return res.status(404).json({ message: 'Advanced payment not found' });

        const { amount, note } = req.body;

        // Add to payments array
        payment.payments.push({ amount, note, date: new Date() });
        payment.paidAmount += amount;

        // Update status
        if (payment.paidAmount >= payment.totalAmount) {
            payment.status = 'completed';
        } else {
            payment.status = 'partial';
        }

        await payment.save();

        eventBus.emitEvent(events.REPAYMENT_MADE, {
            userId: req.user.id,
            advancedPaymentId: payment._id,
            amount,
            type: payment.type
        });

        if (payment.status === 'completed') {
            eventBus.emitEvent(events.PAYMENT_STATUS_CHANGED, {
                userId: req.user.id,
                advancedPaymentId: payment._id,
                status: 'completed'
            });
        }

        res.json(payment);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    create,
    list,
    getById,
    update,
    remove,
    addPartialPayment,
    createRules,
    partialPaymentRules,
};
