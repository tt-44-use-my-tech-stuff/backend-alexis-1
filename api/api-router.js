const router = require('express').Router();
const authRouter = require('./auth/auth-router');
const techItemsRouter = require('./tech_items/tech_items-router');

const { restricted } = require('./auth/auth-middleware');

router.use('/auth', authRouter);
router.use('/tech_items', restricted, techItemsRouter);

module.exports = router;