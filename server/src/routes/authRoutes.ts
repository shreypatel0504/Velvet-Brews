import express from 'express';
import { registerUser, authUser, getMe, getAllUsers } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getMe);
router.get('/users', getAllUsers);

export default router;


