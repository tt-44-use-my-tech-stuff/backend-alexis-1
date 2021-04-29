const Category = require('./categories-model');

const checkCategoryExists = async (req, res, next) => {
  const { category_id } = req.params
  try {
    const category = await Category.findById(category_id);
    if(category){
      req.category = category;
      next();
    } else {
      next({ status: 404, message: "category was not found" });
    }
  } catch(err) {
    next(err);
  }
}

module.exports = {
  checkCategoryExists
}