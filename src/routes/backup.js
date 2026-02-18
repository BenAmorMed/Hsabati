const router = require('express').Router();
const protect = require('../middleware/auth');
const { exportData, importData } = require('../controllers/backupController');

router.use(protect);

router.get('/export', exportData);
router.post('/import', importData);

module.exports = router;
