exports.up = async function (knex) {
  const menus = [
    { day: 'Monday', variant: 'Option 1' },
    { day: 'Tuesday', variant: 'Option 1' },
    { day: 'Wednesday', variant: 'Option 1' },
    { day: 'Thursday', variant: 'Option 1' },
    { day: 'Monday', variant: 'Option 2' },
    { day: 'Tuesday', variant: 'Option 2' },
    { day: 'Wednesday', variant: 'Option 2' },
    { day: 'Friday', variant: 'Option 1' },
    { day: 'Friday', variant: 'Option 2' },
  ];

  const menuIds = await knex('menus').insert(menus).returning('id');

  const dishes = [
    { name: 'Caesar Salad', type: 'salad' },
    { name: 'Greek Salad', type: 'salad' },
    { name: 'Borscht', type: 'starter' },
    { name: 'Tomato Soup', type: 'starter' },
    { name: 'Grilled Chicken', type: 'main course' },
    { name: 'Steak', type: 'main course' },
    { name: 'Apple Juice', type: 'drink' },
    { name: 'Orange Juice', type: 'drink' },
    { name: 'Chocolate Cake', type: 'dessert' },
    { name: 'Ice Cream', type: 'dessert' },
    { name: 'Vegetable Soup', type: 'starter' },
    { name: 'Roast Beef', type: 'main course' },
    { name: 'Water', type: 'drink' },
    { name: 'Fruit Salad', type: 'dessert' },
  ];

  const dishIds = await knex('dishes').insert(dishes).returning(['id', 'type']);

  if (!menuIds.length || !dishIds.length) {
    throw new Error('Error while creating test data');
  }

  const menuDishes = [
    // Option 1 menus
    { menu_id: menuIds[0], dish_type: 'salad' },
    { menu_id: menuIds[0], dish_type: 'starter' },
    { menu_id: menuIds[0], dish_type: 'main course' },
    { menu_id: menuIds[0], dish_type: 'drink' },
    { menu_id: menuIds[0], dish_type: 'dessert' },
    { menu_id: menuIds[1], dish_type: 'salad' },
    { menu_id: menuIds[1], dish_type: 'starter' },
    { menu_id: menuIds[1], dish_type: 'main course' },
    { menu_id: menuIds[2], dish_type: 'salad' },
    { menu_id: menuIds[2], dish_type: 'starter' },
    { menu_id: menuIds[2], dish_type: 'main course' },
    { menu_id: menuIds[2], dish_type: 'drink' },
    { menu_id: menuIds[3], dish_type: 'salad' },
    { menu_id: menuIds[3], dish_type: 'starter' },
    { menu_id: menuIds[3], dish_type: 'dessert' },

    // Option 2 menus
    { menu_id: menuIds[4], dish_type: 'salad' },
    { menu_id: menuIds[4], dish_type: 'starter' },
    { menu_id: menuIds[4], dish_type: 'main course' },
    { menu_id: menuIds[4], dish_type: 'drink' },
    { menu_id: menuIds[5], dish_type: 'salad' },
    { menu_id: menuIds[5], dish_type: 'starter' },
    { menu_id: menuIds[5], dish_type: 'main course' },
    { menu_id: menuIds[5], dish_type: 'dessert' },
    { menu_id: menuIds[6], dish_type: 'salad' },
    { menu_id: menuIds[6], dish_type: 'starter' },
    { menu_id: menuIds[6], dish_type: 'main course' },
    { menu_id: menuIds[6], dish_type: 'drink' },
    { menu_id: menuIds[7], dish_type: 'main course' },
    { menu_id: menuIds[7], dish_type: 'dessert' },
    { menu_id: menuIds[8], dish_type: 'starter' },
    { menu_id: menuIds[8], dish_type: 'drink' },
    { menu_id: menuIds[8], dish_type: 'dessert' },
  ];

  const mappedMenuDishes = menuDishes.map(({ menu_id, dish_type }) => {
    const dish = dishIds.find((d) => d.type === dish_type);
    if (!dish) {
      throw new Error(`Item with type "${dish_type}" not found`);
    }
    return {
      menu_id: menu_id.id || menu_id,
      dish_id: dish.id,
    };
  });

  await knex('menu_dishes').insert(mappedMenuDishes);
};

exports.down = async function (knex) {
  await knex('menu_dishes').truncate();
  await knex('dishes').truncate();
  await knex('menus').truncate();
};
