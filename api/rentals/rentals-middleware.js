const Rental = require('./rentals-model');

const checkRentalExists = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.rental_id);
    console.log(rental);
    if(rental){
      req.rental = rental;
      next();
    } else {
      next({ status: 404, message: "rental was not found" });
    }
  } catch(err) {
    next(err);
  }
}

module.exports = {
  checkRentalExists
}