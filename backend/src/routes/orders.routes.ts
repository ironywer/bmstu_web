import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  advanceCurrentDate,
} from '../controllers/orders.controller';

import {
  moveItemBetweenOrders,
} from '../controllers/items.controller';
const router = Router();

/**
 * GET /api/v1/orders
 * Получить список всех заказов
 */
router.get('/', getOrders);

/**
 * GET /api/v1/orders/:id
 * Получить конкретный заказ по ID
 */
router.get('/:id', getOrderById);

/**
 * POST /api/v1/orders
 * Создать новый заказ
 */
router.post('/', createOrder);

/**
 * PUT /api/v1/orders/:id
 * Обновить существующий заказ
 */
router.put('/:id', updateOrder);

/**
 * DELETE /api/v1/orders/:id
 * Удалить заказ по ID
 */
router.delete('/:id', deleteOrder);

/**
 * POST /api/v1/orders/:fromOrderId/items/:itemId/move/:toOrderId
 * Переместить товар между заказами
 */
router.post('/:fromOrderId/items/:itemId/move/:toOrderId', moveItemBetweenOrders);

/**
 * POST /api/v1/orders/advance-date
 * Продвинуть текущую дату на один день (удаление отгруженных заказов и пополнение склада)
 */
router.post('/advance-date', advanceCurrentDate);

export default router;
