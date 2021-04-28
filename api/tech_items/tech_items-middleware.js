const TechItem = require('./tech_items-model');

const checkTechItemBody = (req, res, next) => {
  const { 
    tech_item_title,
    tech_item_description,
    tech_item_price,
    min_rental_period,
    max_rental_period,
    category_name 
  } = req.body;
  if(
    tech_item_title &&
    tech_item_description &&
    tech_item_price &&
    min_rental_period &&
    max_rental_period &&
    category_name &&
    typeof min_rental_period === 'number' &&
    typeof max_rental_period === 'number' &&
    typeof tech_item_price === 'number' &&
    tech_item_title !== '' &&
    tech_item_description !== '' &&
    category_name !== ''
  ){
    next();
  } else {
    next({
      status: 400,
      message: "tech_item_title, tech_item_description, tech_item_price, min_rental_period max_rental_period, category_name are required"
    });
  }
}

const checkTechItemExists = async (req, res, next) => {
  const { tech_item_id } = req.params;
  try {
    const tech_item = await TechItem.findById(tech_item_id);
    if(tech_item) {
      req.tech_item = tech_item;
      next();
    } else {
      next({ status:404, message: "tech_item was not found" });
    }
  } catch(err) {
    next(err);
  }
}

const checkBelongsToOwner = async (req, res, next) => {
  const { owner_id } = req.params; 
  if(req.decodedToken.subject === Number(owner_id)){
    next();
  } else {
    next({ status: 401, message: "this tech_item does not belong to you" });
  }
}

module.exports = {
  checkTechItemBody,
  checkTechItemExists,
  checkBelongsToOwner
}