import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Coffee, Utensils, Star, Sparkles, Heart, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Navbar, Footer } from "@/components/layout";

export const LandingPage = () => {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(true);
  const heroVideoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (heroVideoRef.current) {
      if (isPlaying) {
        heroVideoRef.current.pause();
      } else {
        heroVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const ambianceGallery = [
    {
      title: "Cozy Leather Lounge",
      subtitle: "Warm ambient lighting & plush seating for relaxed coffee sessions.",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
      tag: "Interior Vibe"
    },
    {
      title: "Artisan Pour-Over Bar",
      subtitle: "Watch master baristas craft single-origin specialty pour-overs.",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
      tag: "Barista Craft"
    },
    {
      title: "Fresh Morning Bakery Counter",
      subtitle: "Daily baked butter croissants, fruit tarts, and Belgian waffles.",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      tag: "In-House Bakery"
    },
    {
      title: "Sunlit Outdoor Garden Patio",
      subtitle: "Breathe in fresh air and greenery under warm fairy-lit pergolas.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      tag: "Outdoor Terrace"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col justify-between">
      <div>
        <Navbar />
        
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden pt-16 pb-28">
          {/* ✅ Video background for hero (cafe & food ambiance) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-25"
              poster="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80"
            >
              {/* Cafe food & ambiance video from Pexels */}
              <source src="https://videos.pexels.com/video-files/4253925/4253925-hd_1920_1080_25fps.mp4" type="video/mp4" />
              <source src="https://videos.pexels.com/video-files/3192559/3192559-hd_1920_1080_25fps.mp4" type="video/mp4" />
            </video>
            {/* Warm soft overlay so text stays readable */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cafe-background)]/95 via-[var(--color-cafe-background)]/85 to-amber-50/70" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              {/* Left Column - Slides in from LEFT */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.15 }}
                className="max-w-2xl"
              >
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.25 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] text-xs font-bold mb-6 shadow-xs"
                >
                  <Sparkles className="h-4 w-4 text-amber-600" /> Surat's Premier Artisan Cafe
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.35 }}
                  className="font-heading text-5xl font-bold tracking-tight text-[var(--color-cafe-text-primary)] sm:text-6xl lg:text-7xl leading-tight"
                >
                  Experience the perfect <span className="text-gradient">pour.</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.45 }}
                  className="mt-6 text-lg text-[var(--color-cafe-text-secondary)] sm:text-xl leading-relaxed"
                >
                  Step into Velvet Brews — where warm wooden aesthetics, handcrafted specialty coffees, and 50 freshly made culinary delights come together in Surat.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.55 }}
                  className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                  <Link to="/menu">
                    <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-[var(--color-cafe-primary)]/25 hover:scale-105 transition-transform">
                      Explore 50 Dishes <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/reservation">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-[var(--color-cafe-primary)] text-[var(--color-cafe-primary)] hover:bg-[var(--color-cafe-primary)] hover:text-white hover:scale-105 transition-transform">
                      📅 Book a Table
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
              
              {/* Right Column - Slides in from RIGHT */}
              <motion.div
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.25 }}
                className="relative mx-auto w-full max-w-lg lg:max-w-none"
              >
                <div className="relative overflow-hidden rounded-3xl shadow-2xl group border-4 border-amber-900/10 hover:border-[var(--color-cafe-primary)]/40 transition-all duration-500 cursor-pointer">
                  {/* ✅ High Quality Cafe Barista & Ambiance Video */}
                  <video
                    ref={heroVideoRef}
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                    className="w-full h-[360px] sm:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    poster="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80"
                  >
                    <source src="https://videos.pexels.com/video-files/3298684/3298684-hd_1920_1080_25fps.mp4" type="video/mp4" />
                    <source src="https://videos.pexels.com/video-files/4253925/4253925-hd_1920_1080_25fps.mp4" type="video/mp4" />
                    <source src="https://videos.pexels.com/video-files/3192559/3192559-hd_1920_1080_25fps.mp4" type="video/mp4" />
                  </video>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                  {/* Top Header Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      ☕ Real Cafe Video Tour
                    </span>

                    {/* Audio & Play Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/20 cursor-pointer"
                        title={isMuted ? "Unmute Video" : "Mute Video"}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={togglePlay}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/20 cursor-pointer"
                        title={isPlaying ? "Pause Video" : "Play Video"}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Video Info (Positioned above floating rating badge for 100% text visibility) */}
                  <div className="absolute bottom-20 sm:bottom-24 left-4 sm:left-6 right-4 sm:right-6 text-white z-10 pointer-events-none">
                    <span className="inline-block text-[11px] uppercase tracking-widest font-bold text-amber-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 shadow-md">
                      📍 Vesu, Surat Flagship
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold mt-2 text-white drop-shadow-lg">
                      Velvet Brews Flagship Cafe
                    </h3>
                    <p className="text-xs text-gray-200 mt-1 line-clamp-1 drop-shadow-sm font-medium">
                      Fresh specialty coffee brews & artisanal wood-fired food.
                    </p>
                  </div>
                </div>

                {/* Floating Review Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.6 }}
                  className="absolute -bottom-5 left-3 sm:-bottom-6 sm:-left-6 rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-2xl border border-amber-100 z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-inner shrink-0">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-heading text-sm sm:text-base font-bold text-gray-900 leading-tight">4.9 / 5.0 Rating</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">from 2,400+ Surat guests</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Cafe Ambiance & Vibe Gallery Section ── */}
        <section className="bg-white py-20 sm:py-24 border-y border-gray-100 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-cafe-primary)] bg-[var(--color-cafe-primary)]/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Step Inside Velvet Brews
              </span>
              <h2 className="font-heading text-3xl font-bold text-[var(--color-cafe-text-primary)] mt-4 sm:text-5xl">
                Experience Our Cafe Ambiance
              </h2>
              <p className="mt-4 text-sm sm:text-lg text-[var(--color-cafe-text-secondary)]">
                Designed for comfort, conversation, and culinary delight. Take a visual tour of our cafe spaces.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {ambianceGallery.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 45, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -8 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: idx * 0.08 }}
                  className="group relative overflow-hidden rounded-3xl bg-amber-950/10 border border-amber-900/10 shadow-md hover:shadow-2xl transition-all duration-500 h-[320px] sm:h-[360px] lg:h-[390px] flex flex-col justify-end"
                >
                  {/* Image with zoom effect */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer gpu-layer"
                  />
                  
                  {/* Soft Gradient Overlay for crisp text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-300 pointer-events-none" />

                  {/* Top Glassmorphic Tag */}
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-extrabold tracking-wider uppercase border border-white/20 shadow-md">
                      {item.tag}
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="relative z-10 p-5 sm:p-6 text-white pointer-events-none">
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed font-medium drop-shadow-sm">
                      {item.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Food Video Showcase Section ── */}
        <section className="bg-[var(--color-cafe-background)] py-20 sm:py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Food Showcase Video (Slides in from LEFT) */}
              <motion.div
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{ scale: 1.01 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white aspect-[4/3] cursor-pointer group">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    poster="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                  >
                    <source src="https://videos.pexels.com/video-files/3298684/3298684-hd_1920_1080_25fps.mp4" type="video/mp4" />
                    <source src="https://videos.pexels.com/video-files/4253925/4253925-hd_1920_1080_25fps.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <div className="text-white">
                      <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">Freshly Crafted Daily</p>
                      <p className="text-sm font-bold">Our Kitchen in Action</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Play className="h-4 w-4 text-white fill-white" />
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.06 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.2 }}
                  className="absolute -bottom-5 right-3 sm:-bottom-6 sm:-right-6 rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-xl border border-gray-100 z-20"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="text-xl sm:text-2xl">🍕</span>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">50+ Dishes</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Fresh every day</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column: Features List (Slides in from RIGHT) */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="mx-auto max-w-2xl lg:text-left"
              >
                <h2 className="font-heading text-3xl font-bold text-[var(--color-cafe-text-primary)] sm:text-4xl">
                  Everything you need for a great time
                </h2>
                <p className="mt-4 text-base text-[var(--color-cafe-text-secondary)]">
                  From quick morning coffees to leisurely weekend brunches, we've designed our service around your convenience.
                </p>
                
                <div className="mt-10 space-y-6">
                  {[
                    {
                      title: "Specialty Roasted Beans",
                      description: "100% Arabica ethically sourced beans roasted to perfection, crafted by our expert baristas.",
                      icon: Coffee
                    },
                    {
                      title: "50 Gourmet Menu Dishes",
                      description: "Pastries, pizzas, sourdough toasts, and artisanal teas prepared fresh to order.",
                      icon: Utensils
                    },
                    {
                      title: "Instant Table & Doorstep Delivery",
                      description: "Order directly for Dine-In with table selection, Takeaway pickup, or Home Delivery.",
                      icon: Heart
                    }
                  ].map((feature, idx) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.05 }}
                      transition={{ type: "spring", stiffness: 110, damping: 14, delay: idx * 0.1 }}
                      className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="rounded-xl bg-[var(--color-cafe-primary)]/10 p-3 ring-1 ring-[var(--color-cafe-primary)]/20 shrink-0">
                        <feature.icon className="h-5 w-5 text-[var(--color-cafe-primary)]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-semibold text-[var(--color-cafe-text-primary)]">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--color-cafe-text-secondary)] leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Customer Feedback & Reviews Section ── */}
        <section className="bg-white py-20 sm:py-24 border-t border-gray-100 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-cafe-primary)] bg-[var(--color-cafe-primary)]/10 px-3.5 py-1.5 rounded-full">
                  Guest Testimonials
                </span>
                <h2 className="font-heading text-4xl font-bold text-[var(--color-cafe-text-primary)] mt-3 sm:text-5xl">
                  Loved by 2,400+ Surat Guests
                </h2>
                <p className="mt-3 text-base text-[var(--color-cafe-text-secondary)]">
                  Real reviews from coffee enthusiasts, remote workers & food lovers in Vesu, Surat.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <Link to="/reviews">
                  <Button variant="outline" className="gap-2 rounded-xl border-gray-300">
                    View All Customer Reviews <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Rahul Sharma",
                  role: "Surat Foodie",
                  comment: "Best Cappuccino and sourdough toast in Surat! The baristas are super friendly and polite.",
                  rating: 5,
                  tag: "Coffee & Food 🍕"
                },
                {
                  name: "Ananya Patel",
                  role: "Regular Guest",
                  comment: "The garden terrace ambiance with fairy lights is so dreamlike. Perfect place for date nights!",
                  rating: 5,
                  tag: "Outdoor Vibe 🌿"
                },
                {
                  name: "Vikram Desai",
                  role: "Verified Guest",
                  comment: "Fast service, clean tables, and amazing coffee aroma as soon as you step inside.",
                  rating: 5,
                  tag: "Fast Service ⚡"
                }
              ].map((review, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ type: "spring", stiffness: 110, damping: 14, delay: idx * 0.1 }}
                >
                  <Card className="p-6 bg-[var(--color-cafe-background)] border-transparent hover:border-[var(--color-cafe-primary)]/30 shadow-xs hover:shadow-lg transition-all h-full flex flex-col justify-between cursor-pointer">
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-cafe-text-secondary)] italic leading-relaxed mb-4">
                        "{review.comment}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200/60">
                      <div>
                        <h4 className="font-bold text-xs text-[var(--color-cafe-text-primary)]">{review.name}</h4>
                        <span className="text-[10px] text-gray-400">{review.role}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] px-2.5 py-1 rounded-full">
                        {review.tag}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};
