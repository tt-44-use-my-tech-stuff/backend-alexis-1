const router = require('express').Router();
const Category = require('./categories-model');
const { checkCategoryExists } = require('./categories-middleware');

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch(err) {
    next(err);
  }
});

router.get('/:category_id', checkCategoryExists, (req, res, next) => {
  res.status(200).json(req.category);
});

router.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

module.exports = router;