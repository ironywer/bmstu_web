import db from '../db';
import { Item } from '../models/dish.model';
import { DishType, isValidDishType } from '../enum/dishTypes.enum';

/**
 * Получить список всех блюд
 */
export const getAllDishes = async (): Promise<Item[]> => {
  return await db('dishes')
    .select('*')
    .then((dishes) => dishes);
};

/**
 * Создать новое блюдо
 */
export const createDishService = async (dishData: Partial<Item>): Promise<Item | null> => {
  const { name, type } = dishData;

  if (!name || !type) {
    throw new Error('Invalid dish data: Name and type are required.');
  }

  if (!isValidDishType(type)) {
    throw new Error(`Invalid dish type. Allowed types: ${Object.values(DishType).join(', ')}`);
  }

  const [newDish] = await db('dishes').insert(dishData).returning('*');
  return newDish || null;
};

/**
 * Обновить блюдо
 */
export const updateDishService = async (dishId: string, updates: Partial<Item>): Promise<Item | null> => {
  const { name, type } = updates;

  if (type && !isValidDishType(type)) {
    throw new Error(`Invalid dish type. Allowed types: ${Object.values(DishType).join(', ')}`);
  }

  const [updatedDish] = await db('dishes').where({ id: dishId }).update(updates).returning('*');
  return updatedDish || null;
};

/**
 * Удалить блюдо
 */
export const deleteDishService = async (dishId: string): Promise<boolean> => {
  const deleted = await db('dishes').where({ id: dishId }).del();
  return deleted > 0;
};


/**
 * Добавить блюдо в меню
 */
export const addDishToMenuService = async (menuId: string, dishId: string): Promise<Item | null> => {
  const menu = await db('menus').where({ id: menuId }).first();
  const dish = await db('dishes').where({ id: dishId }).first();

  if (!menu || !dish) {
    throw new Error('Menu or dish not found.');
  }

  const existingDishOfType = await db('menu_dishes')
    .join('dishes', 'menu_dishes.dish_id', 'dishes.id')
    .where({ menu_id: menuId, type: dish.type })
    .first();

  if (existingDishOfType) {
    throw new Error(`A dish of type "${dish.type}" already exists in the menu.`);
  }

  const dishExists = await db('menu_dishes')
    .where({ menu_id: menuId, dish_id: dishId })
    .first();

  if (dishExists) {
    throw new Error('Item is already added to this menu.');
  }

  await db('menu_dishes').insert({ menu_id: menuId, dish_id: dishId });
  return dish;
};


/**
 * Удалить блюдо из меню
 */
export const removeDishFromMenuService = async (menuId: string, dishId: string): Promise<boolean> => {
  const deleted = await db('menu_dishes').where({ menu_id: menuId, dish_id: dishId }).del();
  return deleted > 0;
};

/**
 * Переместить блюдо между меню
 */
export const moveDishBetweenMenusService = async (
  fromMenuId: string,
  toMenuId: string,
  dishId: string
): Promise<boolean> => {
  const removed = await removeDishFromMenuService(fromMenuId, dishId);
  if (!removed) {
    return false;
  }

  try {
    await addDishToMenuService(toMenuId, dishId);
  } catch {
    await addDishToMenuService(fromMenuId, dishId);
    return false;
  }

  return true;
};


