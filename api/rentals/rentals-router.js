const router = require('express').Router();
const Rental = require('./rentals-model');
const { only } = require('../auth/auth-middleware');
const { checkRentalExists, checkRentalBody, checkRentalMaxMin } = require('./rentals-middleware');

router.get('/', only('renter'), async (req, res, next) => {
  const renter_id = req.decodedToken.subject;
  try {
    const rentals = await Rental.findByRenterId(renter_id);
    res.status(200).json(rentals);
  } catch(err) {
    next(err);
  }
});

router.get('/:rental_id', checkRentalExists, (req, res) => {
  res.status(200).json(req.rental);
});

router.post('/', checkRentalBody, checkRentalMaxMin, async (req, res, next) => { //eslint-disable-line
  const { renter_id, owner_id, tech_item_id, rental_period } = req.body;
  try {
    const newRental = await Rental.create({ renter_id, owner_id, tech_item_id, rental_period });
    res.status(201).json(newRental);
  } catch (err) {
    next(err);
  }
});

router.put('/:rental_id', (req, res, next) => { //eslint-disable-line

});

router.delete('/:rental_id', (req, res, next) => { //eslint-disable-line

});

router.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

module.exports = router;