const protect = require('../middleware/auth');
const { signup, login, logout, refresh, signupRules, loginRules } = require('../controllers/authController');

router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);

module.exports = router;
