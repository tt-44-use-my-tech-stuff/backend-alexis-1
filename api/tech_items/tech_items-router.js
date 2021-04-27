const router = require('express').Router();
const { checkTechItemBody, checkTechItemExists } = require('./tech_items-middleware');

router.get('/', (req, res, next) => {
  res.end()
});

router.get('/:tech_item_id', (req, res, next) => {
  res.end()
});

router.post('/', (req, res, next) => {
  res.end()
});

router.put('/:tech_item_id', (req, res, next) => {
  res.end()
});

router.delete('/:tech_item_id', (req, res, next) => {
  res.end()
});

router.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

module.exports = router;