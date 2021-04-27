const { users } = require('../sample-data');

exports.seed = function(knex) {
  return knex('users').insert(users);
};
