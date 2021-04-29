const db = require('../data/db-config');

const findAll = () => {
  return db('categories as cat');
}

const findById = category_id => {
  return db('categories as cat')
    .where({ category_id })
    .first();
}

const findBy = filter => {
  return db('categories as cat')
    .where(filter);
}

module.exports = {
  findAll,
  findById,
  findBy
}