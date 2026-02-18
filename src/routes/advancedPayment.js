const router = require('express').Router();
const protect = require('../middleware/auth');
const {
    create,
    list,
    getById,
    update,
    remove,
    addPartialPayment,
    createRules,
    partialPaymentRules,
} = require('../controllers/advancedPaymentController');

router.use(protect);

router.route('/').post(createRules, create).get(list);
router.route('/:id').get(getById).put(update).delete(remove);
router.patch('/:id/payment', partialPaymentRules, addPartialPayment);

module.exports = router;
