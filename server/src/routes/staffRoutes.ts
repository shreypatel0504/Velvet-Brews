import { Router } from 'express';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../controllers/staffController';

const router = Router();

router.route('/').get(getStaff).post(createStaff);
router.route('/:id').put(updateStaff).delete(deleteStaff);

export default router;
