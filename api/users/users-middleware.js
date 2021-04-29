const User = require('./users-model');

const checkUserExists = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const user = await User.findById(user_id);
    if(user){
      next();
    } else {
      next({ status: 404, message: "user was not found" });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkUserExists
}