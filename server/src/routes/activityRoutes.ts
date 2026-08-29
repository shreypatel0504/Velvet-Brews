import { Router } from 'express';
import { logActivity, getActivities } from '../controllers/activityController';

const router = Router();

router.get('/', getActivities);
router.post('/', logActivity);

export default router;
