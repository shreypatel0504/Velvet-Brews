import { Router } from 'express';
import {
  createContactMessage,
  getContactMessages,
  updateContactStatus,
  subscribeNewsletter,
  getSubscribers
} from '../controllers/contactController';

const router = Router();

router.get('/', getContactMessages);
router.post('/', createContactMessage);
router.put('/:id', updateContactStatus);
router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', getSubscribers);

export default router;
