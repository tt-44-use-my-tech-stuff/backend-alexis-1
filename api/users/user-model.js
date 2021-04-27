const db = require('../data/db-config');
const { trace } = require('../utils/index');

const findAll = () => {
  return db('users as u')
    .join('roles as r', 'u.role_id', 'r.role_id')
    .select('u.username', 'u.user_id', 'r.role_name');
  }
  
const findBy = filter => {
  return db('users as u')
    .join('roles as r', 'u.role_id', 'r.role_id')
    .where(filter)
    .select('u.username', 'u.user_id', 'u.password', 'r.role_name')
    .orderBy('user_id', 'asc');
}

const findById = async user_id => {
  return db('users as u')
    .join('roles as r', 'u.role_id', 'r.role_id')
    .select('u.username', 'u.user_id', 'r.role_name')
    .where({ user_id })
    .first();
}

const create = async ({ username, password, role_id }) => {
  const [ user ] = await db('users').insert({ username, password, role_id }, ['user_id', 'username', 'role_id']);
  const { role_name } = await db('roles').where({ role_id: user.role_id }).first();
  return {
    user_id: user.user_id,
    username: user.username,
    role_name
  };
}

const update = async (user_id, changes) => {
  await db('users').where({ user_id }).insert(changes);
  return findById(user_id);
}

const deleteById = async user_id => {
  await db('users').where({ user_id }).delete();
  return { user_id };
}


module.exports = {
  findAll,
  findBy,
  findById,
  create,
  update,
  deleteById
}