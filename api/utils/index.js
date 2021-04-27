const { JWT_SECRET } = require('../config/secrets');
const jwt = require('jsonwebtoken');

function generateToken(user) {
  const { user_id, username, role_name } = user;

  const payload = {
    subject: user_id,
    username,
    role_name
  }
  const options = {
    expiresIn: '1h'
  }
  return jwt.sign(payload, JWT_SECRET, options);
}

const trace = label => value => {
  console.log(`${label}: ${JSON.stringify(value)}`);
  return value;
}

module.exports = {
  generateToken,
  trace
}