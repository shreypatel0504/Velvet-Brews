import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';

const router = express.Router();

// Public: place order (customer website)
router.route('/')
  .post(createOrder)
  .get(getOrders); // Admin portal reads live orders

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(updateOrderStatus); // Admin portal updates order status

export default router;
