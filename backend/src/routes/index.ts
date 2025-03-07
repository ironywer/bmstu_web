import { Router } from 'express';
import ordersRoutes from './orders.routes';
import itemsRoutes from './items.routes';

const router = Router();

router.use('/orders', ordersRoutes);
router.use('/items', itemsRoutes);

export default router;
