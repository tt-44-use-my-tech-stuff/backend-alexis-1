const { categories } = require('../sample-data');

exports.seed = function(knex) {
  return knex('categories').insert(categories);
};
