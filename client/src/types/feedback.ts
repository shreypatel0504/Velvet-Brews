export interface FeedbackItem {
  id?: string;
  customerName: string;
  rating: number;
  comment: string;
  date?: string;
  status?: 'published' | 'pending' | 'archived';
  category?: string;
}
