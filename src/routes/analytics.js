const router = require('express').Router();
const mongoose = require('mongoose');
const protect = require('../middleware/auth');
const { summary, categories } = require('../controllers/analyticsController');

router.use(protect);

// Convert string userId to ObjectId for aggregation pipelines
router.use((req, _res, next) => {
    req.userObjectId = new mongoose.Types.ObjectId(req.user.id);
    next();
});

router.get('/summary', summary);
router.get('/categories', categories);

module.exports = router;
