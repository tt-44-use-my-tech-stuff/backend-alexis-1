const Rental = require('./rentals-model');
const TechItem = require('../tech_items/tech_items-model');

const checkRentalExists = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.rental_id);
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

const checkRentalBody = async (req, res, next) => {
  const { renter_id, owner_id, tech_item_id, rental_period } = req.body;
  try {
    if(!tech_item_id){
      next({ status: 400, message: "tech_item_id is required" });
    } else {
      const techItem = await TechItem.findById(tech_item_id);
      if(techItem){
        if(renter_id && owner_id && tech_item_id && rental_period){
          next();
        } else {
          next({ status: 400, message: "`rental_period`, `owner_id`, `renter_id` and `tech_item_id` are required" })
        }
      } else {
        next({ status: 404, message: "tech_item was not found" });
      }
    }
  } catch (err) {
    next(err);
  }
}

const checkRentalMaxMin = async (req, res, next) => {
  const { rental_period, tech_item_id } = req.body;
  try {
    const techItem = await TechItem.findById(tech_item_id);
    if(techItem){
      if(techItem.min_rental_period < rental_period && techItem.max_rental_period > rental_period){
        next();
      } else {
        next({ status: 400, message: "rental_period cannot be greater or less than max/min rental period" })
      }
    } else {
      next({ status: 404, message: "tech_item was not found" });
    }
  } catch(err) {
    next(err);
  }
}

module.exports = {
  checkRentalExists,
  checkRentalBody,
  checkRentalMaxMin
}