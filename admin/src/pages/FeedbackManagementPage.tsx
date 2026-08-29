import React from "react";
import { Star, Trash2, RefreshCw, MessageSquare, Plus, Reply, Check, X, Filter, Sparkles, Send } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { socket } from "../utils/socket";
import { sharedSync } from "../utils/sharedSync";
import { playFeedbackChime } from "../utils/audioAlert";
import toast from "react-hot-toast";

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  category: string;
  ownerReply?: string;
  createdAt: string;
}

const EMPTY_REVIEW_FORM = {
  customerName: '',
  rating: 5,
  comment: '',
  category: 'Overall'
};

export const FeedbackManagementPage = () => {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  
  // Reply State
  const [replyingReview, setReplyingReview] = React.useState<Review | null>(null);
  const [replyText, setReplyText] = React.useState<string>('');
  const [sendingReply, setSendingReply] = React.useState(false);

  // Add Review Modal State
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addForm, setAddForm] = React.useState(EMPTY_REVIEW_FORM);
  const [savingReview, setSavingReview] = React.useState(false);

  const fetchReviews = React.useCallback(async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      const apiRev = Array.isArray(data) ? data : [];
      const localRev = sharedSync.getReviews();

      const merged: any[] = [...apiRev];
      localRev.forEach(lr => {
        const id = lr._id || lr.id;
        if (id && !merged.some(m => (m._id === id || m.id === id))) {
          merged.unshift(lr);
        }
      });

      setReviews(merged);
    } catch {
      setReviews(sharedSync.getReviews() as any);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReviews();
    socket.connect();

    // Live socket sync
    socket.on('new-review', (review: any) => {
      playFeedbackChime();
      setReviews(prev => {
        const id = review._id || review.id;
        if (id && prev.some(r => r._id === id || (r as any).id === id)) return prev;
        return [review, ...prev];
      });
      toast.success(`⭐ New Review from ${review.customerName || 'Customer'}!`, { duration: 5000 });
    });

    socket.on('new-feedback', (data: any) => {
      playFeedbackChime();
      const formatted: Review = {
        _id: data._id || data.id || data.orderId || `r-${Date.now()}`,
        customerName: data.customerName || "Customer",
        rating: Math.round(Number(data.averageRating || data.rating) || 5),
        comment: data.comments || data.comment || (data.selectedTags ? data.selectedTags.join(', ') : "Great experience!"),
        category: "Overall",
        createdAt: new Date().toISOString()
      };
      setReviews(prev => {
        if (prev.some(r => r._id === formatted._id)) return prev;
        return [formatted, ...prev];
      });
      toast.success(`⭐ New Feedback from ${formatted.customerName}!`, { duration: 5000 });
    });

    socket.on('review-updated', (updated: any) => {
      setReviews(prev => prev.map(r => r._id === updated._id ? { ...r, ...updated } : r));
    });

    socket.on('review-deleted', (payload: any) => {
      setReviews(prev => prev.filter(r => r._id !== payload._id));
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchReviews();
    });

    return () => {
      socket.off('new-review');
      socket.off('new-feedback');
      socket.off('review-updated');
      socket.off('review-deleted');
      socket.disconnect();
      unsubscribeStorage();
    };
  }, [fetchReviews]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${replyingReview._id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerReply: replyText })
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setReviews(prev => prev.map(r => r._id === replyingReview._id ? { ...r, ownerReply: replyText } : r));
      toast.success("Owner response published!");
      setReplyingReview(null);
      setReplyText('');
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.customerName || !addForm.comment) {
      toast.error("Customer name and review comment are required");
      return;
    }

    setSavingReview(true);
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });

      if (!res.ok) throw new Error();
      toast.success("New review added to customer wall!");
      setShowAddModal(false);
      setAddForm(EMPTY_REVIEW_FORM);
      fetchReviews();
    } catch {
      toast.error("Failed to save review");
    } finally {
      setSavingReview(false);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm(`Delete review by "${review.customerName}"?`)) return;
    try {
      await fetch(`http://localhost:5000/api/reviews/${review._id}`, { method: 'DELETE' });
      setReviews(prev => prev.filter(r => r._id !== review._id));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesRating = 
      activeFilter === 'all' ? true :
      activeFilter === '5star' ? r.rating === 5 :
      activeFilter === '4star' ? r.rating === 4 :
      r.rating <= 3;

    const matchesCategory = categoryFilter === 'all' ? true : r.category === categoryFilter;

    return matchesRating && matchesCategory;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const lowRatingCount = reviews.filter(r => r.rating <= 3).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[var(--color-cafe-primary)]" /> Customer Feedback & Reviews
          </h2>
          <p className="text-sm text-gray-500">
            Live reviews from the customer website + reply & publish responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add Review
          </Button>

          <button
            onClick={fetchReviews}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Analytics Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-amber-50 border border-amber-200 text-center">
          <p className="text-3xl font-black text-amber-700">{avgRating} ★</p>
          <p className="text-xs font-bold text-amber-800 mt-0.5">Average Rating</p>
        </Card>

        <Card className="p-4 bg-blue-50 border border-blue-200 text-center">
          <p className="text-3xl font-black text-blue-700">{reviews.length}</p>
          <p className="text-xs font-bold text-blue-800 mt-0.5">Total Feedback</p>
        </Card>

        <Card className="p-4 bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-3xl font-black text-emerald-700">{fiveStarCount}</p>
          <p className="text-xs font-bold text-emerald-800 mt-0.5">5 ★ Top Reviews</p>
        </Card>

        <Card className="p-4 bg-red-50 border border-red-200 text-center">
          <p className="text-3xl font-black text-red-700">{lowRatingCount}</p>
          <p className="text-xs font-bold text-red-800 mt-0.5">Needs Attention (≤ 3★)</p>
        </Card>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Rating:
          </span>
          {[
            { id: 'all', label: 'All Ratings' },
            { id: '5star', label: '5 ★ Only' },
            { id: '4star', label: '4 ★ Only' },
            { id: 'low', label: '≤ 3 ★ Critical' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all border ${
                activeFilter === f.id
                  ? 'bg-[var(--color-cafe-primary)] text-white border-transparent shadow-xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1 text-xs font-bold focus:outline-none"
          >
            {['all', 'Overall', 'Coffee', 'Food', 'Service', 'Experience'].map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Cards Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50/80 border-dashed">
          <Star className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-700">No Reviews Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Reviews submitted on the customer wall or created here will appear live.
          </p>
          <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-2 text-xs">
            <Plus className="h-4 w-4" /> Add First Review
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => (
            <Card key={review._id} className="p-5 bg-white shadow-xs space-y-3 border border-gray-100 hover:border-amber-200 transition-all flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 leading-tight">{review.customerName}</h3>
                    <span className="text-[10px] font-bold text-[var(--color-cafe-primary)] uppercase tracking-wider">
                      {review.category || 'Overall'}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-xs text-gray-700 italic leading-relaxed mt-3">"{review.comment}"</p>

                {/* Owner Reply Display */}
                {review.ownerReply && (
                  <div className="mt-3 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px] mb-1">
                      <Sparkles className="h-3 w-3 text-[var(--color-cafe-primary)]" /> Owner Response:
                    </span>
                    <p className="text-amber-800 italic">"{review.ownerReply}"</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setReplyingReview(review);
                    setReplyText(review.ownerReply || '');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Reply className="h-3.5 w-3.5" />
                  {review.ownerReply ? 'Edit Response' : 'Reply as Owner'}
                </button>

                <button
                  onClick={() => handleDelete(review)}
                  className="p-1.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete Review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* OWNER REPLY MODAL */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Reply to {replyingReview.customerName}</h3>
                <p className="text-xs text-gray-500">Your response will be visible on the website feedback wall.</p>
              </div>
              <button onClick={() => setReplyingReview(null)} className="p-1 text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs text-gray-600">
              <span className="font-bold text-gray-800">Customer Comment:</span>
              <p className="italic mt-1">"{replyingReview.comment}"</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Official Owner Response</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Thank you for your visit! We look forward to welcoming you again..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" onClick={() => setReplyingReview(null)} variant="outline" className="w-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={sendingReply} className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  {sendingReply ? "Publishing..." : "Publish Response"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ADD NEW REVIEW MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900">Add Customer Review</h3>
                <p className="text-xs text-gray-500">Record customer feedback directly into the system.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <Input
                  label="Customer Name *"
                  value={addForm.customerName}
                  onChange={(e: any) => setAddForm({ ...addForm, customerName: e.target.value })}
                  placeholder="e.g. Priya Patel"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Star Rating</label>
                  <select
                    value={addForm.rating}
                    onChange={(e) => setAddForm({ ...addForm, rating: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30 font-bold text-amber-700"
                  >
                    <option value={5}>5 ★★★★★ (Excellent)</option>
                    <option value={4}>4 ★★★★☆ (Very Good)</option>
                    <option value={3}>3 ★★★☆☆ (Average)</option>
                    <option value={2}>2 ★★☆☆☆ (Poor)</option>
                    <option value={1}>1 ★☆☆☆☆ (Terrible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  >
                    {['Overall', 'Coffee', 'Food', 'Service', 'Experience'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Review Comment *</label>
                <textarea
                  value={addForm.comment}
                  onChange={(e) => setAddForm({ ...addForm, comment: e.target.value })}
                  rows={3}
                  placeholder="Enter the review comment..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowAddModal(false)} variant="outline" className="w-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={savingReview} className="w-full gap-2">
                  <Check className="h-4 w-4" />
                  {savingReview ? "Saving..." : "Add to Review Wall"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
