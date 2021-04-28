const router = require('express').Router();

router.get('/', (req, res, next) => { //eslint-disable-line

});

router.get('/:rental_id', (req, res, next) => { //eslint-disable-line

});

router.post('/', (req, res, next) => { //eslint-disable-line

});

router.put('/:rental_id', (req, res, next) => { //eslint-disable-line

});

router.delete('/:rental_id', (req, res, next) => { //eslint-disable-line

});

router.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

module.exports = router;