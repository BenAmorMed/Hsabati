const router = require('express').Router();
const protect = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/userController');

router.use(protect);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
