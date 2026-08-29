import { Router } from 'express';
import { getReviews, createReview, deleteReview, replyReview } from '../controllers/reviewController';

const router = Router();

router.route('/').get(getReviews).post(createReview);
router.route('/:id').delete(deleteReview);
router.route('/:id/reply').put(replyReview);

export default router;
