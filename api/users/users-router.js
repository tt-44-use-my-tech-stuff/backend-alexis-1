const router = require('express').Router();
const rentalsRouter = require('../rentals/rentals-router');
const { checkUserExists } = require('./users-middleware');

router.use('/:user_id/rentals', checkUserExists, rentalsRouter);

router.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
})

module.exports = router;