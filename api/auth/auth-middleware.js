const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/secrets');
const User = require('../users/users-model');

const only = role_name => (req, res, next) => {
  req.decodedToken.role_name === role_name
  ? next()
  : next({ message: `only accessible to ${role_name}` });
}

const restricted = (req, res, next) => {
  const token = req.headers.authorization;
  if(!token){
    res.status(401).json({ message: "Token required" });
  } else {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if(err){
        res.status(401).json({ message: "Token invalid" });
      } else {
        req.decodedToken = decoded;
        next();
      }
    });
  }
}

const checkUsernameFree = async (req, res, next) => {
  const { username } = req.body;
  try {
    const [ user ] = await User.findBy({ username });
    !user
    ? next()
    : next({ status: 400, message: "username is taken" });
  } catch(err){
    next(err);
  }
}

const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  try {
    const [ user ] = await User.findBy({ username });
    !user
    ? next({ status: 404, message: "user was not found" })
    : next();
  } catch(err) {
    next(err);
  }
}

const checkUserBodyRegister = (req, res, next) => {
  const { username, password, role_id } = req.body;
  const valid = Boolean(username && password && role_id && (role_id === 1 || role_id === 2));
  valid
  ? next()
  : next({ status: 400, message: "username and password are required" });
}

const checkUserBodyLogin = (req, res, next) => {
  const { username, password } = req.body;
  const valid = Boolean(username && password);
  valid
  ? next()
  : next({ status: 400, message: "username and password are required" });
}

module.exports = {
  only,
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkUserBodyRegister,
  checkUserBodyLogin
}