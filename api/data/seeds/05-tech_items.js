const { tech_items } = require('../sample-data');

exports.seed = function(knex) {
  return knex('tech_items').insert(tech_items);
};
