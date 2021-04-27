const bcrypt = require('bcryptjs');

const rounds = process.env.DB_ROUNDS || 8;
const hash = bcrypt.hashSync('1234', rounds);

const users = [
  { username: 'woody', password: hash, role_id: 1 },  // 1
  { username: 'buzz', password: hash, role_id: 1 },
  { username: 'jessie', password: hash, role_id: 1 },
  { username: 'slinky', password: hash, role_id: 1 }, 
  { username: 'rex', password: hash, role_id: 1 }, // 5
  { username: 'lil_bo_peep', password: hash, role_id: 2 },
  { username: 'zurg', password: hash, role_id: 2 },
  { username: 'hamm', password: hash, role_id: 2 },
  { username: 'mr_potato_head', password: hash, role_id: 2 },
  { username: 'wheezy', password: hash, role_id: 2 } // 10
];

module.exports = users;