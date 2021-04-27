const { roles } = require('../sample-data');

exports.seed = function(knex) {
  return knex('roles').insert(roles);
};
