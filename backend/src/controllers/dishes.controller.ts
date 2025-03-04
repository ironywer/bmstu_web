import { Request, Response } from 'express';
import {
  getAllDishes,
  createDishService,
  addDishToMenuService,
  removeDishFromMenuService,
  moveDishBetweenMenusService,
  updateDishService,
  deleteDishService,
} from '../services/dishes.service';
import { createResponse } from '../utils/response.util';

export const getDishes = async (req: Request, res: Response) => {
  try {
    const dishes = await getAllDishes();
    res.status(200).json(createResponse(true, dishes, { count: dishes.length }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error fetching dishes' }));
  }
};

export const createDish = async (req: Request, res: Response) => {
  try {
    const newDish = await createDishService(req.body);
    res.status(201).json(createResponse(true, newDish, { message: 'Item created successfully' }));
  } catch (error) {
    res.status(400).json(createResponse(false, null, { message: 'Invalid request data' }));
  }
};

export const updateDish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedDish = await updateDishService(id, req.body);
    if (!updatedDish) {
      return res.status(404).json(createResponse(false, null, { message: 'Item not found' }));
    }
    res.status(200).json(createResponse(true, updatedDish, { message: 'Item updated successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error updating dish' }));
  }
};

export const deleteDish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteDishService(id);
    if (!result) {
      return res.status(404).json(createResponse(false, null, { message: 'Item not found' }));
    }
    res.status(200).json(createResponse(true, null, { message: 'Item deleted successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error deleting dish' }));
  }
};


export const addDishToMenu = async (req: Request, res: Response) => {
  try {
    const { menuId } = req.params;
    const { dishId } = req.body;

    const result = await addDishToMenuService(menuId, dishId);

    if (!result) {
      return res.status(400).json(
        createResponse(false, null, {
          message: 'Item cannot be added to the menu due to constraints.',
        })
      );
    }

    res.status(200).json(
      createResponse(true, result, {
        message: 'Item added to menu successfully',
      })
    );
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return res.status(400).json(
        createResponse(false, null, {
          message: error.message,
        })
      );
    }

    if (error.message.includes('Menu or dish not found.')) {
      return res.status(400).json(
        createResponse(false, null, {
          message: error.message,
        })
      );
    }

    res.status(500).json(
      createResponse(false, null, {
        message: 'Error adding dish to menu',
        error: error.message,
      })
    );
  }
};

export const removeDishFromMenu = async (req: Request, res: Response) => {
  try {
    const { menuId, dishId } = req.params;
    const result = await removeDishFromMenuService(menuId, dishId);
    if (!result) {
      return res.status(404).json(createResponse(false, null, { message: 'Item not found in menu' }));
    }
    res.status(200).json(createResponse(true, null, { message: 'Item removed from menu successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error removing dish from menu' }));
  }
};

export const moveDishBetweenMenus = async (req: Request, res: Response) => {
  try {
    const { fromMenuId, dishId } = req.params;
    const { toMenuId } = req.body;
    const result = await moveDishBetweenMenusService(fromMenuId, toMenuId, dishId);
    if (!result) {
      return res.status(400).json(createResponse(false, null, { message: 'Cannot move dish between menus' }));
    }
    res.status(200).json(createResponse(true, null, { message: 'Item moved successfully' }));
  } catch (error) {
    res.status(500).json(createResponse(false, null, { message: 'Error moving dish between menus' }));
  }
};
