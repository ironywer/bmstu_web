import { Request, Response } from 'express';
import {
  getAllItems,
  createItemService,
  updateItemService,
  deleteItemService,
  addItemToOrderService,
  moveItemBetweenOrdersService,
  removeItemFromOrderService,
} from '../services/items.service';
import { createResponse } from '../utils/response.util';


export const moveItemBetweenOrders = async (req: Request, res: Response) => {
  try {
    const { fromOrderId, itemId, toOrderId } = req.params;
    const { quantity } = req.body; // Извлекаем количество товара

    if (!quantity || quantity <= 0) {
      return res.status(400).json(createResponse(false, null, { message: 'Quantity must be greater than zero' }));
    }

    const result = await moveItemBetweenOrdersService(fromOrderId, toOrderId, itemId, quantity);

    if (!result) {
      return res.status(400).json(createResponse(false, null, { message: 'Cannot move item between orders' }));
    }

    res.status(200).json(createResponse(true, null, { message: 'Item moved successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error moving item between orders' }));
  }
};

export const getItems = async (req: Request, res: Response) => {
  try {
    const items = await getAllItems();
    res.status(200).json(createResponse(true, items, { count: items.length }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error fetching items' }));
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const newItem = await createItemService(req.body);
    res.status(201).json(createResponse(true, newItem, { message: 'Item created successfully' }));
  } catch (error) {
    res.status(400).json(createResponse(false, null, { message: 'Invalid request data' }));
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedItem = await updateItemService(id, req.body);
    if (!updatedItem) {
      return res.status(404).json(createResponse(false, null, { message: 'Item not found' }));
    }
    res.status(200).json(createResponse(true, updatedItem, { message: 'Item updated successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error updating item' }));
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteItemService(id);
    if (!result) {
      return res.status(404).json(createResponse(false, null, { message: 'Item not found' }));
    }
    res.status(200).json(createResponse(true, null, { message: 'Item deleted successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error deleting item' }));
  }
};

/**
 * Добавить товар в заказ (учитывается наличие на складе)
 */
export const addItemToOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { itemId, quantity } = req.body;

    const result = await addItemToOrderService(orderId, itemId, quantity);

    if (!result) {
      return res.status(400).json(
        createResponse(false, null, {
          message: 'Item cannot be added to the order due to constraints.',
        })
      );
    }

    res.status(200).json(
      createResponse(true, result, {
        message: 'Item added to order successfully',
      })
    );
  } catch (error: any) {
    if (error.message.includes('Not enough stock')) {
      return res.status(400).json(createResponse(false, null, { message: error.message }));
    }

    if (error.message.includes('Order or item not found.')) {
      return res.status(400).json(createResponse(false, null, { message: error.message }));
    }

    res.status(500).json(createResponse(false, null, { message: 'Error adding item to order', error: error.message }));
  }
};

/**
 * Удалить товар из заказа (возвращает товар на склад)
 */
export const removeItemFromOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, itemId } = req.params;
    const result = await removeItemFromOrderService(orderId, itemId);

    if (!result) {
      return res.status(404).json(createResponse(false, null, { message: 'Item not found in order' }));
    }

    res.status(200).json(createResponse(true, null, { message: 'Item removed from order successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error removing item from order' }));
  }
};
