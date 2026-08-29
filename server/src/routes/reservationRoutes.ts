import { Router } from 'express';
import { createReservation, getReservations, updateReservationStatus, deleteReservation } from '../controllers/reservationController';

const router = Router();

router.route('/').post(createReservation).get(getReservations);
router.route('/:id/status').put(updateReservationStatus);
router.route('/:id').delete(deleteReservation);

export default router;
