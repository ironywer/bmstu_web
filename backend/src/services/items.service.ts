import db from '../db';
import { Item } from '../models/item.model';

/**
 * Получить список всех товаров на складе
 */
export const getAllItems = async (): Promise<Item[]> => {
  return await db('items')
    .select('*')
    .then((items) => items);
};

/**
 * Создать новый товар
 */
export const createItemService = async (itemData: Partial<Item>): Promise<Item | null> => {
  const { name, quantity } = itemData;

  if (!name || quantity === undefined || quantity < 0) {
    throw new Error('Invalid item data: Name and valid quantity are required.');
  }

  const [newItem] = await db('items').insert(itemData).returning('*');
  return newItem || null;
};

/**
 * Обновить товар на складе
 */
export const updateItemService = async (itemId: string, updates: Partial<Item>): Promise<Item | null> => {
  if (updates.quantity !== undefined && updates.quantity < 0) {
    throw new Error('Quantity cannot be negative.');
  }

  const [updatedItem] = await db('items').where({ id: itemId }).update(updates).returning('*');
  return updatedItem || null;
};

/**
 * Удалить товар
 */
export const deleteItemService = async (itemId: string): Promise<boolean> => {
  const deleted = await db('items').where({ id: itemId }).del();
  return deleted > 0;
};

/**
 * Добавить товар в заказ (проверка доступного количества)
 */
export const addItemToOrderService = async (orderId: string, itemId: string, quantity: number): Promise<Item | null> => {
  const order = await db('orders').where({ id: orderId }).first();
  const item = await db('items').where({ id: itemId }).first();

  if (!order || !item) {
    throw new Error('Order or item not found.');
  }

  if (item.quantity < quantity) {
    throw new Error(`Not enough stock for item "${item.name}". Available: ${item.quantity}`);
  }

  // Проверяем, есть ли уже этот товар в заказе
  const existingOrderItem = await db('order_items')
    .where({ order_id: orderId, item_id: itemId })
    .first();

  if (existingOrderItem) {
    throw new Error('Item is already added to this order.');
  }

  // Добавляем товар в заказ
  await db('order_items').insert({ order_id: orderId, item_id: itemId, quantity });

  // Обновляем количество на складе
  await db('items').where({ id: itemId }).decrement('quantity', quantity);

  return item;
};

/**
 * Удалить товар из заказа (возвращает товар на склад)
 */
export const removeItemFromOrderService = async (orderId: string, itemId: string): Promise<boolean> => {
  const orderItem = await db('order_items').where({ order_id: orderId, item_id: itemId }).first();
  
  if (!orderItem) {
    throw new Error('Item not found in order.');
  }

  // Удаляем товар из заказа
  const deleted = await db('order_items').where({ order_id: orderId, item_id: itemId }).del();

  if (deleted > 0) {
    // Возвращаем товар на склад
    await db('items').where({ id: itemId }).increment('quantity', orderItem.quantity);
  }

  return deleted > 0;
};

/**
 * Переместить товар между заказами (учитывается наличие на складе)
 */
export const moveItemBetweenOrdersService = async (
  fromOrderId: string,
  toOrderId: string,
  itemId: string,
  quantity: number
): Promise<boolean> => {
  const removed = await removeItemFromOrderService(fromOrderId, itemId);
  if (!removed) {
    return false;
  }

  try {
    await addItemToOrderService(toOrderId, itemId, quantity);
  } catch {
    await addItemToOrderService(fromOrderId, itemId, quantity);
    return false;
  }

  return true;
};
