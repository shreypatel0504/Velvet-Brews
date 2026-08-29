import * as React from "react";
import { motion } from "framer-motion";
import { Star, Heart, Sparkles, Filter, Plus } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Card, Button } from "@/components/ui";
import { FeedbackModal } from "@/components/modals";
import { socket } from "@/utils/socket";

interface PublicReview {
  id: string;
  name: string;
  avatar: string;
  date: string;
  averageRating: number;
  foodRating: number;
  serviceRating: number;
  behaviorRating: number;
  vibeRating: number;
  comment: string;
  tags: string[];
  ownerReply?: string;
}

const initialPublicReviews: PublicReview[] = [
  {
    id: "rev-1",
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    date: "Yesterday",
    averageRating: 5.0,
    foodRating: 5,
    serviceRating: 5,
    behaviorRating: 5,
    vibeRating: 5,
    comment: "Absolutely in love with Velvet Brews! The Cappuccino and Sourdough Toast were divine. Staff behavior in Vesu branch is super warm and polite.",
    tags: ["Delicious Food", "Friendly Staff", "Great Ambiance"],
    ownerReply: "Thank you Rahul! We're so glad you enjoyed our coffee & sourdough!"
  },
  {
    id: "rev-2",
    name: "Ananya Patel",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    date: "2 days ago",
    averageRating: 4.8,
    foodRating: 5,
    serviceRating: 4,
    behaviorRating: 5,
    vibeRating: 5,
    comment: "The outdoor garden patio vibe at night with fairy lights is unbeatable in Surat. Tried the Margherita pizza & Masala Chai — top notch quality!",
    tags: ["Aesthetic Vibe", "Delicious Food"],
    ownerReply: "Thanks Ananya! See you again soon on our garden terrace!"
  },
  {
    id: "rev-3",
    name: "Vikram Desai",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    date: "3 days ago",
    averageRating: 5.0,
    foodRating: 5,
    serviceRating: 5,
    behaviorRating: 5,
    vibeRating: 5,
    comment: "Fast service, clean tables, and amazing coffee aroma as soon as you walk in. The chocolate croissant is freshly baked daily!",
    tags: ["Quick Delivery", "Clean Tables", "Friendly Staff"]
  },
  {
    id: "rev-4",
    name: "Pooja Trivedi",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    date: "5 days ago",
    averageRating: 4.9,
    foodRating: 5,
    serviceRating: 4,
    behaviorRating: 5,
    vibeRating: 5,
    comment: "Perfect spot for remote work in Vesu! Ample power outlets, high-speed Wi-Fi, and courteous baristas who remember your usual drink.",
    tags: ["Great Ambiance", "Friendly Staff"]
  },
  {
    id: "rev-5",
    name: "Hardik Shah",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    date: "1 week ago",
    averageRating: 5.0,
    foodRating: 5,
    serviceRating: 5,
    behaviorRating: 5,
    vibeRating: 5,
    comment: "Tried the Bombay Grilled Sandwich and Hazelnut Mocha. 10/10 flavor! Extremely clean hygiene standards.",
    tags: ["Delicious Food", "Clean Tables"]
  }
];

export const ReviewsPage = () => {
  const [reviews, setReviews] = React.useState<PublicReview[]>(initialPublicReviews);
  const [activeFilter, setActiveFilter] = React.useState<string>("all");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    socket.connect();

    socket.on('new-feedback', (data: any) => {
      const newRev: PublicReview = {
        id: `rev-${Date.now()}`,
        name: data.customerName || "Surat Guest",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        date: "Just now",
        averageRating: Number(data.averageRating) || 5.0,
        foodRating: data.foodRating || 5,
        serviceRating: data.serviceRating || 5,
        behaviorRating: data.behaviorRating || 5,
        vibeRating: data.vibeRating || 5,
        comment: data.comments || "Loved the cafe experience!",
        tags: data.selectedTags || ["Great Experience"]
      };
      setReviews(prev => [newRev, ...prev]);
    });

    return () => {
      socket.off('new-feedback');
      socket.disconnect();
    };
  }, []);

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === "5star") return r.averageRating >= 4.9;
    if (activeFilter === "food") return r.tags.some(t => t.toLowerCase().includes("food") || t.toLowerCase().includes("delicious"));
    if (activeFilter === "vibe") return r.tags.some(t => t.toLowerCase().includes("vibe") || t.toLowerCase().includes("ambiance"));
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Feedback Modal for customer submission */}
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Hero Banner */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] text-xs font-bold mb-4">
              <Sparkles className="h-4 w-4" /> 2,400+ Verified Surat Guest Reviews
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-gradient mb-4">
              Customer Reviews & Wall of Love
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--color-cafe-text-secondary)] leading-relaxed">
              Read authentic feedback from real guests in Surat. From our handcrafted specialty coffees to staff hospitality & cafe vibe.
            </p>
            
            <div className="mt-6">
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="rounded-full px-8 gap-2 shadow-lg shadow-[var(--color-cafe-primary)]/25"
              >
                <Plus className="h-5 w-5" /> Write Your Review
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Cafe Ratings Scorecard */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Card className="p-8 bg-white border border-gray-100 shadow-[var(--shadow-cafe-card)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Score Highlight */}
              <div className="lg:col-span-4 text-center lg:border-r lg:border-gray-100 lg:pr-8">
                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-amber-50 text-amber-600 mb-3">
                  <Star className="h-10 w-10 fill-amber-400 text-amber-400" />
                </div>
                <div className="font-heading text-5xl font-bold text-[var(--color-cafe-text-primary)]">
                  4.9 <span className="text-xl text-gray-400">/ 5.0</span>
                </div>
                <div className="flex justify-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-500">Based on 2,400+ reviews in Vesu, Surat</p>
              </div>

              {/* Detailed Category Breakdown Bars */}
              <div className="lg:col-span-8 space-y-4">
                {[
                  { label: "🍕 Food & Drink Quality", score: "4.9", percent: 98 },
                  { label: "⚡ Service Speed & Delivery", score: "4.8", percent: 96 },
                  { label: "😊 Staff Behavior & Hospitality", score: "4.9", percent: 98 },
                  { label: "🌿 Overall Cafe Ambiance & Vibe", score: "5.0", percent: 100 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>{item.label}</span>
                      <span className="text-[var(--color-cafe-primary)]">{item.score} / 5.0 ★</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[var(--color-cafe-primary)] to-[var(--color-cafe-secondary)] h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </Card>
        </section>

        {/* Filter Pills */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            {[
              { id: "all", label: "All Reviews" },
              { id: "5star", label: "🌟 5-Star Top Loved" },
              { id: "food", label: "🍕 Food & Taste Reviews" },
              { id: "vibe", label: "🌿 Cafe Ambiance Reviews" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                  activeFilter === f.id
                    ? "bg-[var(--color-cafe-primary)] text-white border-transparent shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Customer Reviews Feed */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full"
              >
                <Card className="p-6 h-full flex flex-col justify-between bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div>
                    {/* Header User info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          className="h-10 w-10 rounded-full object-cover shadow-xs border border-gray-200"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[var(--color-cafe-text-primary)]">{rev.name}</h4>
                          <span className="text-[10px] text-gray-400">{rev.date} • Verified Guest</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-xs text-amber-900">{rev.averageRating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Category Breakdown Badges */}
                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-gray-50 rounded-xl mb-4 text-[10px] text-center font-bold text-gray-700">
                      <div>🍕 {rev.foodRating}/5</div>
                      <div>⚡ {rev.serviceRating}/5</div>
                      <div>😊 {rev.behaviorRating}/5</div>
                      <div>🌿 {rev.vibeRating}/5</div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs text-[var(--color-cafe-text-secondary)] leading-relaxed mb-4 italic">
                      "{rev.comment}"
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {rev.tags.map((t, idx) => (
                        <span key={idx} className="bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cafe Owner Response */}
                  {rev.ownerReply && (
                    <div className="mt-4 pt-3 border-t border-gray-100 bg-amber-50/50 p-3 rounded-xl text-[11px] text-amber-900">
                      <div className="font-bold flex items-center gap-1 text-[var(--color-cafe-primary)] mb-1">
                        <Heart className="h-3.5 w-3.5 fill-[var(--color-cafe-primary)]" /> Velvet Brews Management:
                      </div>
                      <p className="italic text-gray-700">{rev.ownerReply}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};
