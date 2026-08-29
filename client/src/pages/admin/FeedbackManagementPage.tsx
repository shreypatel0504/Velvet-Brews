import React from "react";
import { AlertCircle, ThumbsUp, MessageSquare, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { socket } from "@/utils/socket";
import { sharedSync } from "@/utils/sharedSync";
import toast from "react-hot-toast";

interface FeedbackItem {
  orderId: string;
  customerName: string;
  foodRating: number;
  serviceRating: number;
  behaviorRating: number;
  vibeRating: number;
  averageRating: string;
  isPoorFeedback: boolean;
  selectedTags: string[];
  comments: string;
  createdAt: string;
}

export const FeedbackManagementPage = () => {
  const [feedbacks, setFeedbacks] = React.useState<FeedbackItem[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'poor' | 'positive'>('all');

  const fetchFeedbacks = React.useCallback(async () => {
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

      const formatted: FeedbackItem[] = merged.map((r: any) => ({
        orderId: r._id || r.id || `REV-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: r.customerName || "Guest",
        foodRating: r.foodRating || r.rating || 5,
        serviceRating: r.serviceRating || r.rating || 5,
        behaviorRating: r.behaviorRating || r.rating || 5,
        vibeRating: r.vibeRating || r.rating || 5,
        averageRating: String(r.averageRating || r.rating || "5.0"),
        isPoorFeedback: Boolean(r.isPoorFeedback || (r.rating && r.rating <= 3)),
        selectedTags: Array.isArray(r.selectedTags) ? r.selectedTags : (r.comment ? [r.comment] : ["Feedback"]),
        comments: r.comments || r.comment || "Great experience!",
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"
      }));

      setFeedbacks(formatted);
    } catch {
      const localRev = sharedSync.getReviews();
      const formatted: FeedbackItem[] = localRev.map((r: any) => ({
        orderId: r._id || r.id || `REV-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: r.customerName || "Guest",
        foodRating: r.rating || 5,
        serviceRating: r.rating || 5,
        behaviorRating: r.rating || 5,
        vibeRating: r.rating || 5,
        averageRating: String(r.rating || "5.0"),
        isPoorFeedback: Boolean(r.rating && r.rating <= 3),
        selectedTags: r.comment ? [r.comment] : ["Feedback"],
        comments: r.comment || "Great experience!",
        createdAt: "Recently"
      }));
      setFeedbacks(formatted);
    }
  }, []);

  React.useEffect(() => {
    fetchFeedbacks();
    socket.connect();

    // Listen for real-time customer feedback submission
    socket.on('new-feedback', (data: any) => {
      const newFb: FeedbackItem = {
        orderId: data.orderId || data._id || `REV-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: data.customerName || "Guest",
        foodRating: data.foodRating || data.rating || 5,
        serviceRating: data.serviceRating || data.rating || 5,
        behaviorRating: data.behaviorRating || data.rating || 5,
        vibeRating: data.vibeRating || data.rating || 5,
        averageRating: String(data.averageRating || data.rating || "5.0"),
        isPoorFeedback: Boolean(data.isPoorFeedback || (data.rating && data.rating <= 3)),
        selectedTags: Array.isArray(data.selectedTags) ? data.selectedTags : ["Live Feedback"],
        comments: data.comments || data.comment || "Great experience!",
        createdAt: "Just now"
      };
      setFeedbacks(prev => [newFb, ...prev]);
      toast.success(`⭐ New Feedback from ${newFb.customerName}!`);
    });

    socket.on('new-review', (data: any) => {
      const newFb: FeedbackItem = {
        orderId: data._id || data.id || `REV-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: data.customerName || "Guest",
        foodRating: data.rating || 5,
        serviceRating: data.rating || 5,
        behaviorRating: data.rating || 5,
        vibeRating: data.rating || 5,
        averageRating: String(data.rating || "5.0"),
        isPoorFeedback: Boolean(data.rating && data.rating <= 3),
        selectedTags: data.comment ? [data.comment] : ["Review"],
        comments: data.comment || "Great experience!",
        createdAt: "Just now"
      };
      setFeedbacks(prev => {
        if (prev.some(f => f.orderId === newFb.orderId)) return prev;
        return [newFb, ...prev];
      });
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchFeedbacks();
    });

    return () => {
      socket.off('new-feedback');
      socket.off('new-review');
      socket.disconnect();
      unsubscribeStorage();
    };
  }, [fetchFeedbacks]);

  const total = feedbacks.length || 1;
  const avgFood = (feedbacks.reduce((sum, f) => sum + Number(f.foodRating), 0) / total).toFixed(1);
  const avgService = (feedbacks.reduce((sum, f) => sum + Number(f.serviceRating), 0) / total).toFixed(1);
  const avgBehavior = (feedbacks.reduce((sum, f) => sum + Number(f.behaviorRating), 0) / total).toFixed(1);
  const avgVibe = (feedbacks.reduce((sum, f) => sum + Number(f.vibeRating), 0) / total).toFixed(1);
  const overallAvg = (feedbacks.reduce((sum, f) => sum + Number(f.averageRating), 0) / total).toFixed(1);

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === 'poor') return f.isPoorFeedback;
    if (filter === 'positive') return !f.isPoorFeedback;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">Customer Feedback & Reviews</h2>
          <p className="text-sm text-[var(--color-cafe-text-secondary)]">Monitor food, service, staff behavior & vibe ratings live.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFeedbacks} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh Feed
          </Button>
        </div>
      </div>

      {/* Average Ratings KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-[var(--color-cafe-primary)] to-amber-800 text-white shadow-md">
          <span className="text-xs uppercase font-bold text-amber-200 tracking-wider">Overall Cafe Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-heading text-3xl font-bold">{overallAvg}</span>
            <span className="text-xs text-amber-200">/ 5.0</span>
          </div>
          <p className="text-[11px] text-amber-100 mt-1">{feedbacks.length} total customer reviews</p>
        </Card>

        <Card className="p-4 bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>🍕 Food Quality</span>
            <span className="font-bold text-amber-600">{avgFood} ★</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(Number(avgFood) / 5) * 100}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>⚡ Service Speed</span>
            <span className="font-bold text-amber-600">{avgService} ★</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(Number(avgService) / 5) * 100}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>😊 Staff Behavior</span>
            <span className="font-bold text-amber-600">{avgBehavior} ★</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(Number(avgBehavior) / 5) * 100}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-100 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
            <span>🌿 Cafe Vibe</span>
            <span className="font-bold text-amber-600">{avgVibe} ★</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(Number(avgVibe) / 5) * 100}%` }} />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all' ? 'bg-[var(--color-cafe-primary)] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          All Feedback ({feedbacks.length})
        </button>
        <button
          onClick={() => setFilter('poor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'poor' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          ⚠️ Needs Improvement ({feedbacks.filter(f => f.isPoorFeedback).length})
        </button>
        <button
          onClick={() => setFilter('positive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'positive' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          🌟 Happy Guests ({feedbacks.filter(f => !f.isPoorFeedback).length})
        </button>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {filteredFeedbacks.map((fb, idx) => (
          <Card
            key={idx}
            className={`p-6 transition-all border ${
              fb.isPoorFeedback 
                ? 'bg-red-50/40 border-red-200' 
                : 'bg-white border-gray-100 hover:border-gray-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${fb.isPoorFeedback ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {fb.isPoorFeedback ? <AlertCircle className="h-5 w-5" /> : <ThumbsUp className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{fb.customerName}</h4>
                  <p className="text-xs text-gray-500">{fb.orderId} • {fb.createdAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  fb.isPoorFeedback ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Average: {fb.averageRating} ★
                </span>
              </div>
            </div>

            {/* Category Ratings Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 bg-gray-50/80 p-3 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Food</span>
                <span className="font-bold text-gray-800">🍕 {fb.foodRating} / 5</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Service</span>
                <span className="font-bold text-gray-800">⚡ {fb.serviceRating} / 5</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Staff Behavior</span>
                <span className="font-bold text-gray-800">😊 {fb.behaviorRating} / 5</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Cafe Vibe</span>
                <span className="font-bold text-gray-800">🌿 {fb.vibeRating} / 5</span>
              </div>
            </div>

            {/* Improvement / Compliment Tags */}
            {fb.selectedTags && fb.selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {fb.selectedTags.map((tag, i) => (
                  <span key={i} className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                    fb.isPoorFeedback ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Customer Detailed Comments */}
            {fb.comments && (
              <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs text-gray-700 italic">
                "{fb.comments}"
              </div>
            )}
          </Card>
        ))}

        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No feedback matching this filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
