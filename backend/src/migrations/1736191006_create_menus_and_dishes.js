exports.up = function (knex) {
  return knex.schema
    .createTable('orders', (table) => {
      table.increments('id').primary();
      table.string('customerName', 255).notNullable();
      table.date('orderDate').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('items', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.integer('quantity').unsigned().notNullable().defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('order_items', (table) => {
      table.increments('id').primary();
      table
        .integer('order_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE');
      table
        .integer('item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('items')
        .onDelete('CASCADE');
      table.integer('quantity').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.unique(['order_id', 'item_id']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('order_items')
    .dropTableIfExists('items')
    .dropTableIfExists('orders');
};
