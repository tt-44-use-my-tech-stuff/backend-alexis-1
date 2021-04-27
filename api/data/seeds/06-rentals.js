const { rentals } = require('../sample-data');

exports.seed = function(knex) {
  return knex('rentals').insert(rentals);
};
