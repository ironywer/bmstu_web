exports.up = async function (knex) {
  // Создаём тестовые заказы
  const orders = [
    { customerName: 'John Doe', orderDate: '2025-03-10' },
    { customerName: 'Jane Smith', orderDate: '2025-03-11' },
    { customerName: 'Alice Johnson', orderDate: '2025-03-12' },
    { customerName: 'Bob Brown', orderDate: '2025-03-13' },
  ];

  const orderIds = await knex('orders').insert(orders).returning('id');

  // Создаём тестовые товары на складе
  const items = [
    { name: 'Laptop', quantity: 10 },
    { name: 'Smartphone', quantity: 15 },
    { name: 'T-Shirt', quantity: 25 },
    { name: 'Sofa', quantity: 5 },
    { name: 'Drill', quantity: 8 },
    { name: 'Headphones', quantity: 12 },
    { name: 'Rice', quantity: 30 },
    { name: 'Coffee', quantity: 20 },
  ];

  const itemIds = await knex('items').insert(items).returning(['id', 'name']);

  if (!orderIds.length || !itemIds.length) {
    throw new Error('Error while creating test data');
  }

  // Связываем товары с заказами (моделируем заказанные позиции)
  const orderItems = [
    { order_id: orderIds[0], item_name: 'Laptop', quantity: 2 },
    { order_id: orderIds[0], item_name: 'Smartphone', quantity: 1 },
    { order_id: orderIds[1], item_name: 'T-Shirt', quantity: 3 },
    { order_id: orderIds[1], item_name: 'Coffee', quantity: 2 },
    { order_id: orderIds[2], item_name: 'Sofa', quantity: 1 },
    { order_id: orderIds[2], item_name: 'Drill', quantity: 2 },
    { order_id: orderIds[3], item_name: 'Headphones', quantity: 1 },
    { order_id: orderIds[3], item_name: 'Rice', quantity: 5 },
  ];

  const mappedOrderItems = orderItems.map(({ order_id, item_name, quantity }) => {
    const item = itemIds.find((i) => i.name === item_name);
    if (!item) {
      throw new Error(`Item "${item_name}" not found`);
    }
    return {
      order_id: order_id.id || order_id,
      item_id: item.id,
      quantity,
    };
  });

  await knex('order_items').insert(mappedOrderItems);
};

exports.down = async function (knex) {
  await knex('order_items').truncate();
  await knex('items').truncate();
  await knex('orders').truncate();
};
