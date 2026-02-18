const router = require('express').Router();
const protect = require('../middleware/auth');
const {
    create,
    list,
    getById,
    update,
    remove,
    createRules,
} = require('../controllers/transactionController');

router.use(protect);

router.route('/').post(createRules, create).get(list);
router.route('/:id').get(getById).put(update).delete(remove);

module.exports = router;
