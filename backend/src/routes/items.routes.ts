import { Router } from 'express';
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  addItemToOrder,
  removeItemFromOrder,
} from '../controllers/items.controller';

const router = Router();

/**
 * GET /api/v1/items
 * Получить список всех товаров на складе
 */
router.get('/', getItems);

/**
 * POST /api/v1/items
 * Создать новый товар
 */
router.post('/', createItem);

/**
 * PUT /api/v1/items/:id
 * Обновить информацию о товаре
 */
router.put('/:id', updateItem);

/**
 * DELETE /api/v1/items/:id
 * Удалить товар
 */
router.delete('/:id', deleteItem);

/**
 * POST /api/v1/orders/:orderId/items
 * Добавить товар в заказ
 */
router.post('/orders/:orderId/items', addItemToOrder);

/**
 * DELETE /api/v1/orders/:orderId/items/:itemId
 * Удалить товар из заказа
 */
router.delete('/orders/:orderId/items/:itemId', removeItemFromOrder);

export default router;
