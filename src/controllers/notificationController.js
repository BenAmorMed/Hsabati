const Notification = require('../models/Notification');

/**
 * GET /notifications
 */
const list = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /notifications/:id/read
 */
const markRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /notifications/read-all
 */
const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (err) {
        next(err);
    }
};

module.exports = { list, markRead, markAllRead };
