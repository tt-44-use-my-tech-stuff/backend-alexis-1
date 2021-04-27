
exports.up = function(knex) {
  return knex.schema
  .createTable('roles', tbl => {
    tbl.increments('role_id');
    tbl.string('role_name').unique().notNullable();
  })
  .createTable('categories', tbl => {
    tbl.increments('category_id');
    tbl.string('category_name').unique().notNullable();
  })
  .createTable('users', tbl => {
    tbl.increments('user_id');
    tbl.string('username').unique().notNullable();
    tbl.string('password').notNullable();
    tbl.integer('role_id')
      .unsigned()
      .notNullable()
      .references('role_id')
      .inTable('roles')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  })
  .createTable('tech_items', tbl => {
    tbl.increments('tech_item_id');
    tbl.string('tech_item_title').notNullable();
    tbl.string('tech_item_description');
    tbl.decimal('tech_item_price').notNullable();
    tbl.integer('min_rental_period').notNullable();
    tbl.integer('max_rental_period').notNullable();
    tbl.integer('category_id')
      .unsigned()
      .notNullable()
      .references('category_id')
      .inTable('categories')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
    tbl.integer('owner_id')
      .unsigned()
      .notNullable()
      .references('user_id')
      .inTable('users')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  })
  .createTable('rentals', tbl => {
    tbl.increments('rental_id');
    tbl.integer('rental_period');
    tbl.timestamp('created_at').defaultTo(knex.fn.now());
    tbl.integer('owner_id')
      .unsigned()
      .notNullable()
      .references('user_id')
      .inTable('users')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
    tbl.integer('renter_id')
      .unsigned()
      .notNullable()
      .references('user_id')
      .inTable('users')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
    tbl.integer('tech_item_id')
      .unsigned()
      .notNullable()
      .references('tech_item_id')
      .inTable('tech_items')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
};

exports.down = function(knex) {
  return knex.schema
  .dropTableIfExists('rentals')
  .dropTableIfExists('tech_items')
  .dropTableIfExists('users')
  .dropTableIfExists('categories')
  .dropTableIfExists('roles')
};