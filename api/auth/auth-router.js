const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../users/user-model');
const { generateToken } = require('../utils');
const { checkUserBodyRegister, checkUserBodyLogin, checkUsernameFree, checkUsernameExists, restricted } = require('./auth-middleware');

router.post('/register', checkUserBodyRegister, checkUsernameFree, async (req, res, next) => {
  const { username, password, role_id } = req.body;

  const rounds = process.env.DB_ROUNDS || 8;
  const hash = bcrypt.hashSync(password, rounds);
  
  try {
    const user = await User.create({ username, password: hash, role_id });
    res.status(201).json(user);
  } catch(err) {
    next(err);
  }
});

router.post('/login', checkUserBodyLogin, checkUsernameExists, async (req, res, next) => {
  const { username, password } = req.body;

  const [ user ] = await User.findBy({ username });
  
  if(bcrypt.compareSync(password, user.password)){
    const token = generateToken(user);
    res.status(200).json({
      message: `welcome back, ${user.username}`,
      user_id: user.user_id,
      username: user.username,
      role_name: user.role_name,
      token
    });
  } else {
    next({ status: 401, message: "invalid credentials" });
  }
});

router.get('/logout', (req, res, next) => {
  res.status(200).json({ message: "logged out" });
});

router.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

module.exports = router;