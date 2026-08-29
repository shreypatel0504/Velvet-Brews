import React from "react";
import { Star, MessageSquare, Send, AlertCircle, ThumbsUp, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { socket } from "@/utils/socket";
import { sharedSync } from "@/utils/sharedSync";
import { ThankYouModal } from "./ThankYouModal";

interface FeedbackFormProps {
  orderId?: string;
  onSuccess?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ orderId, onSuccess }) => {
  const [foodRating, setFoodRating] = React.useState<number>(0);
  const [serviceRating, setServiceRating] = React.useState<number>(0);
  const [behaviorRating, setBehaviorRating] = React.useState<number>(0);
  const [vibeRating, setVibeRating] = React.useState<number>(0);

  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [comments, setComments] = React.useState<string>("");
  const [customerName, setCustomerName] = React.useState<string>("");
  const [submitted, setSubmitted] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showThankYouModal, setShowThankYouModal] = React.useState<boolean>(false);

  // Check if any rating is 3 stars or lower (Low/Poor rating detection)
  const ratingsList = [foodRating, serviceRating, behaviorRating, vibeRating].filter(r => r > 0);
  const hasLowRating = ratingsList.some(r => r <= 3);

  const lowRatingTags = [
    "Slow Service",
    "Food Temperature",
    "Staff Courtesy",
    "Music Volume",
    "Table Cleanliness",
    "Order Accuracy",
    "Pricing & Value",
    "Seating Comfort"
  ];

  const highRatingTags = [
    "Delicious Food",
    "Friendly Staff",
    "Great Ambiance",
    "Quick Delivery",
    "Clean Tables",
    "Aesthetic Vibe"
  ];

  const currentTags = hasLowRating ? lowRatingTags : highRatingTags;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleStarClick = (categorySetter: (val: number) => void, val: number) => {
    categorySetter(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodRating || !serviceRating || !behaviorRating || !vibeRating) {
      toast.error("Please provide ratings for all 4 categories!");
      return;
    }

    setIsSubmitting(true);
    const avgVal = Number(((foodRating + serviceRating + behaviorRating + vibeRating) / 4).toFixed(1));
    const generatedId = `REV-${Math.floor(1000 + Math.random() * 9000)}`;

    const feedbackData = {
      _id: generatedId,
      id: generatedId,
      orderId: orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || "Guest Customer",
      foodRating,
      serviceRating,
      behaviorRating,
      vibeRating,
      rating: Math.round(avgVal),
      averageRating: avgVal,
      isPoorFeedback: hasLowRating,
      selectedTags,
      comment: comments || selectedTags.join(', ') || "Great experience!",
      comments: comments || selectedTags.join(', ') || "Great experience!",
      category: "Overall",
      createdAt: new Date().toISOString()
    };

    // Save to shared sync so admin panel sees it instantly
    sharedSync.saveReview({
      _id: feedbackData._id,
      id: feedbackData.id,
      customerName: feedbackData.customerName,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      category: feedbackData.category,
      createdAt: feedbackData.createdAt
    });

    try {
      socket.connect();

      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: feedbackData.customerName,
          rating: feedbackData.rating,
          comment: feedbackData.comment,
          category: feedbackData.category
        })
      });
    } catch {
      console.warn("Server POST /api/reviews failed, using shared storage fallback");
    }

    // Socket broadcasts for admin
    socket.emit('new-feedback', feedbackData);
    socket.emit('new-review', feedbackData);

    setSubmitted(true);
    setShowThankYouModal(true);
    toast.success("Thank you! Your feedback has been sent to our cafe management.");
    if (onSuccess) onSuccess();
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <>
        {/* Dedicated Happy Note Pop-up Modal */}
        <ThankYouModal
          isOpen={showThankYouModal}
          onClose={() => setShowThankYouModal(false)}
        />

        <Card className="p-8 text-center bg-gradient-to-b from-amber-50/90 via-white to-amber-50/50 border-amber-200/80 shadow-lg relative overflow-hidden">
          <div className="w-20 h-20 bg-[var(--color-cafe-primary)] text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[var(--color-cafe-primary)]/30 transform -rotate-3 hover:rotate-0 transition-transform">
            <Heart className="h-10 w-10 fill-white" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-cafe-primary)] bg-[var(--color-cafe-primary)]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Heartfelt Appreciation
          </span>

          <h3 className="font-heading text-3xl font-bold text-[var(--color-cafe-text-primary)] mb-3">
            Thank You & Visit Again!
          </h3>

          <p className="text-sm text-[var(--color-cafe-text-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
            {hasLowRating 
              ? "We appreciate your honest feedback. Our owner & staff in Surat will review your notes to make your next visit extraordinary!"
              : "We are deeply grateful for your visit to Velvet Brews Surat! Your review fuels our passion for artisan coffee & great hospitality."}
          </p>

          <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-[var(--color-cafe-secondary)] max-w-sm mx-auto mb-6 shadow-xs">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">🎁 A Gift For Your Next Visit</p>
            <div className="font-mono text-lg font-bold text-[var(--color-cafe-primary)] tracking-widest bg-[var(--color-cafe-primary)]/10 py-1.5 rounded-xl">
              VELVET10
            </div>
            <p className="text-[11px] text-amber-800 mt-1 font-medium">Show this code for 10% OFF your next coffee or meal!</p>
          </div>

          <Button onClick={() => setShowThankYouModal(true)} variant="outline" size="sm" className="rounded-full text-xs gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> Re-open Thank You Pop-up
          </Button>
        </Card>
      </>
    );
  }

  const renderStarSelector = (label: string, icon: string, currentVal: number, setter: (v: number) => void) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-colors gap-2">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <div>
          <h4 className="font-bold text-xs text-[var(--color-cafe-text-primary)]">{label}</h4>
          <p className="text-[10px] text-[var(--color-cafe-text-secondary)]">Rate from 1 to 5 stars</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(setter, star)}
            className="p-1 hover:scale-125 transition-transform focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= currentVal
                  ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                  : "text-gray-300 hover:text-amber-200"
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-bold w-6 text-center text-amber-800 ml-1">
          {currentVal > 0 ? `${currentVal}/5` : ''}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Dedicated Pop-up Modal Trigger */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={() => setShowThankYouModal(false)}
      />

      <Card className="p-6 md:p-8 bg-white border border-gray-100 shadow-[var(--shadow-cafe-card)]">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-3 rounded-2xl bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)]">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[var(--color-cafe-text-primary)]">Customer Feedback</h3>
            <p className="text-xs text-[var(--color-cafe-text-secondary)]">Rate your food, service, staff behavior & cafe vibe.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Name Optional */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Your Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-cafe-primary)]"
            />
          </div>

          {/* 4 Category Star Ratings */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Rating Categories</label>
            {renderStarSelector("Food & Drink Quality", "🍕", foodRating, setFoodRating)}
            {renderStarSelector("Service Speed & Delivery", "⚡", serviceRating, setServiceRating)}
            {renderStarSelector("Staff Behavior & Hospitality", "😊", behaviorRating, setBehaviorRating)}
            {renderStarSelector("Overall Cafe Ambiance & Vibe", "🌿", vibeRating, setVibeRating)}
          </div>

          {/* Dynamic Conditional Improvement / Compliment Box */}
          {ratingsList.length > 0 && (
            <div className={`p-4 rounded-2xl border transition-all ${
              hasLowRating ? "bg-amber-50/80 border-amber-200" : "bg-emerald-50/80 border-emerald-200"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {hasLowRating ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-900">What went wrong? What can we improve?</h4>
                      <p className="text-[11px] text-amber-700">Select any quick reasons below or type your suggestions.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-emerald-900">We're glad you loved it! What stood out?</h4>
                      <p className="text-[11px] text-emerald-700">Select what made your experience special.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {currentTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                        isSelected
                          ? hasLowRating
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}{tag}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Comments Textarea */}
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  hasLowRating
                    ? "Please tell us what we can do to make it right for you next time..."
                    : "Share any extra compliments or notes for our cafe team..."
                }
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-cafe-primary)] bg-white"
              />
            </div>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full h-12 text-sm font-bold gap-2 shadow-md shadow-[var(--color-cafe-primary)]/20"
          >
            <Send className="h-4 w-4" /> Submit Feedback
          </Button>
        </form>
      </Card>
    </>
  );
};
