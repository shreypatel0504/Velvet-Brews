import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController';

const router = express.Router();

// Public: GET all menu items (website reads this)
router.route('/')
  .get(getMenuItems)
  .post(createMenuItem); // Admin portal calls this (no JWT needed for local admin portal)

router.route('/:id')
  .put(updateMenuItem)    // Admin: update price, availability, name etc.
  .delete(deleteMenuItem); // Admin: remove item

export default router;
