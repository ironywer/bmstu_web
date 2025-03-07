import { Request, Response } from 'express';
import {
  getAllOrders,
  getOrderByIdService,
  createOrderService,
  updateOrderService,
  deleteOrderService,
  advanceCurrentDateService,
} from '../services/orders.service';
import { createResponse } from '../utils/response.util';

/**
 * Получить список всех заказов
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();
    res.status(200).json(createResponse(true, orders, { count: orders.length }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error fetching orders' }));
  }
};

/**
 * Получить заказ по ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await getOrderByIdService(id);
    if (!order) {
      return res.status(404).json(createResponse(false, null, { message: 'Order not found' }));
    }
    res.status(200).json(createResponse(true, order, {}));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error fetching order' }));
  }
};

/**
 * Создать новый заказ (с проверкой даты)
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const newOrder = await createOrderService(req.body);
    res.status(201).json(createResponse(true, newOrder, { message: 'Order created successfully' }));
  } catch (error) {
    res.status(400).json(createResponse(false, null, { message: 'Invalid request data' }));
  }
};

/**
 * Обновить существующий заказ
 */
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedOrder = await updateOrderService(id, req.body);
    if (!updatedOrder) {
      return res.status(404).json(createResponse(false, null, { message: 'Order not found' }));
    }
    res.status(200).json(createResponse(true, updatedOrder, { message: 'Order updated successfully' }));
  } catch (error) {
    res.status(400).json(createResponse(false, null, { message: 'Invalid request data' }));
  }
};

/**
 * Удалить заказ
 */
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteOrderService(id);
    if (!deleted) {
      return res.status(404).json(createResponse(false, null, { message: 'Order not found' }));
    }
    res.status(200).json(createResponse(true, null, { message: 'Order deleted successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error deleting order' }));
  }
};

/**
 * Продвинуть текущую дату на день вперёд (удаление старых заказов, пополнение склада)
 */
export const advanceCurrentDate = async (req: Request, res: Response) => {
  try {
    await advanceCurrentDateService();
    res.status(200).json(createResponse(true, null, { message: 'Current date advanced by one day. Old orders processed, stock replenished.' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error advancing date' }));
  }
};
