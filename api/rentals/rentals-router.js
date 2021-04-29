const router = require('express').Router();
const Rental = require('./rentals-model');

router.get('/', async (req, res, next) => {
  const renter_id = req.decodedToken.subject;
  try {
    const rentals = await Rental.findByRenterId(renter_id);
    res.status(200).json(rentals);
  } catch(err) {
    next(err);
  }
});

router.get('/:rental_id', (req, res, next) => {

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