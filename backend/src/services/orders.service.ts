import db from '../db';
import { Order } from '../models/order.model';

/**
 * Получить список всех заказов (устаревшие заказы удаляются)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  const currentDate = new Date();

  // Удаляем заказы с истекшей датой
  await db('orders').where('orderDate', '<', currentDate).del();

  // Получаем актуальные заказы
  const orders = await db('orders').select('*').orderBy('orderDate', 'asc');

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await db('order_items')
        .join('items', 'order_items.item_id', 'items.id')
        .where('order_items.order_id', order.id)
        .select('items.id', 'items.name', 'order_items.quantity', 'order_items.created_at');

      return {
        ...order,
        items,
      };
    })
  );

  return ordersWithItems;
};

/**
 * Получить заказ по ID
 */
export const getOrderByIdService = async (id: string): Promise<Order | null> => {
  const order = await db('orders').where({ id }).first();

  if (!order) {
    return null;
  }

  const items = await db('order_items')
    .join('items', 'order_items.item_id', 'items.id')
    .where('order_items.order_id', order.id)
    .select('items.id', 'items.name', 'order_items.quantity', 'order_items.created_at');

  return { ...order, items };
};

/**
 * Создать новый заказ (проверка даты заказа)
 */
export const createOrderService = async (orderData: Partial<Order>): Promise<Order> => {
  const { customerName, orderDate } = orderData;

  if (!customerName || !orderDate) {
    throw new Error('Invalid order data: Customer name and order date are required.');
  }

  const currentDate = new Date();
  if (new Date(orderDate) < currentDate) {
    throw new Error('Order date cannot be in the past.');
  }

  const [newOrder] = await db('orders').insert(orderData).returning('*');
  newOrder.items = [];
  return newOrder;
};

/**
 * Обновить существующий заказ
 */
export const updateOrderService = async (id: string, updates: Partial<Order>): Promise<Order | null> => {
  if (updates.orderDate) {
    const currentDate = new Date();
    if (new Date(updates.orderDate) < currentDate) {
      throw new Error('Order date cannot be in the past.');
    }
  }

  const [updatedOrder] = await db('orders').where({ id }).update(updates).returning('*');
  return updatedOrder || null;
};

/**
 * Удалить заказ по ID
 */
export const deleteOrderService = async (id: string): Promise<boolean> => {
  const deleted = await db('orders').where({ id }).del();
  return deleted > 0;
};

/**
 * Продвинуть текущую дату на один день (удаление отгруженных заказов, пополнение склада)
 */
export const advanceCurrentDateService = async (): Promise<void> => {
  const currentDate = new Date();

  // Удаляем заказы, у которых дата совпадает с текущей
  const shippedOrders = await db('orders').where('orderDate', '=', currentDate).returning('*');
  await db('orders').where('orderDate', '=', currentDate).del();

  // Пополняем склад случайными значениями
  const items = await db('items').select('*');
  for (const item of items) {
    const randomRestock = Math.floor(Math.random() * 10) + 1; // Пополнение от 1 до 10 единиц
    await db('items').where({ id: item.id }).increment('quantity', randomRestock);
  }
};
