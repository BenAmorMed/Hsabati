const UserSettings = require('../models/UserSettings');

/**
 * GET /user/settings
 */
const getSettings = async (req, res, next) => {
    try {
        let settings = await UserSettings.findOne({ userId: req.user.id });
        if (!settings) {
            settings = await UserSettings.create({ userId: req.user.id });
        }
        res.json(settings);
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /user/settings
 */
const updateSettings = async (req, res, next) => {
    try {
        const allowed = ['currency', 'language', 'theme', 'notifications'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const settings = await UserSettings.findOneAndUpdate(
            { userId: req.user.id },
            updates,
            { new: true, upsert: true, runValidators: true }
        );

        res.json(settings);
    } catch (err) {
        next(err);
    }
};

module.exports = { getSettings, updateSettings };
