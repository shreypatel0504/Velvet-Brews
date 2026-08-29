import { Request, Response } from 'express';
import Review from '../models/Review';
import { io } from '../app';

const defaultReviews = [
  { _id: 'r1', customerName: 'Aarav Mehta', rating: 5, comment: 'Best espresso in Surat! The ambience is absolutely stunning and the staff is incredibly warm.', category: 'Coffee', createdAt: new Date('2026-07-20') },
  { _id: 'r2', customerName: 'Priya Patel', rating: 5, comment: 'The sourdough woodfired pizza was extraordinary. Perfectly charred crust with amazing toppings.', category: 'Food', createdAt: new Date('2026-07-19') },
  { _id: 'r3', customerName: 'Vikram Joshi', rating: 4, comment: 'Cozy seating and fast service. The Caramel Macchiato was perfect on a rainy evening.', category: 'Coffee', createdAt: new Date('2026-07-18') },
  { _id: 'r4', customerName: 'Sneha Shah', rating: 5, comment: 'Celebrated my birthday here. Amazing vibe, great food and the staff made it so special!', category: 'Experience', createdAt: new Date('2026-07-17') },
];

export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    if (reviews.length > 0) {
      res.json(reviews);
    } else {
      res.json(defaultReviews);
    }
  } catch (error: any) {
    res.json(defaultReviews);
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { customerName, rating, comment, category } = req.body;
    
    const review = new Review({
      customerName: customerName || 'Anonymous',
      rating: Number(rating) || 5,
      comment: comment || '',
      category: category || 'Overall'
    });

    const createdReview = await review.save();
    // Broadcast to admin panel
    io.emit('new-review', createdReview);
    res.status(201).json(createdReview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const replyReview = async (req: Request, res: Response) => {
  try {
    const { ownerReply } = req.body;
    const review = await Review.findById(req.params.id);
    if (review) {
      review.ownerReply = ownerReply;
      const updated = await review.save();
      io.emit('review-updated', updated);
      res.json(updated);
    } else {
      io.emit('review-updated', { _id: req.params.id, ownerReply });
      res.json({ _id: req.params.id, ownerReply });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    await Review.deleteOne({ _id: req.params.id });
    io.emit('review-deleted', { _id: req.params.id });
    res.json({ message: 'Review deleted', _id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
