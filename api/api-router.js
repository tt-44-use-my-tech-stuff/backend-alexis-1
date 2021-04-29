const router = require('express').Router();
const authRouter = require('./auth/auth-router');
const techItemsRouter = require('./tech_items/tech_items-router');
const categoriesRouter = require('./categories/categories-router');
const usersRouter = require('./users/users-router');

const { restricted } = require('./auth/auth-middleware');

router.use('/auth', authRouter);
router.use('/tech_items', restricted, techItemsRouter);
router.use('/categories', restricted, categoriesRouter);
router.use('/users', restricted, usersRouter);

module.exports = router;