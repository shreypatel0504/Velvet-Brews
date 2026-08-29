import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, Heart, Award, Users, Camera, Sparkles } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Card, Button } from "@/components/ui";

export const AboutPage = () => {
  const ambianceSpaces = [
    {
      title: "The Main Espresso Bar",
      location: "Indoor Lounge",
      description: "Our signature bar equipped with dual-boiler La Marzocco machines and custom pour-over stations.",
      image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Warm Leather & Wood Lounge",
      location: "Mezzanine Level",
      description: "Quiet corners equipped with high-speed Wi-Fi, power outlets, and plush seating for reading & work.",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Fresh Artisan Bakery Display",
      location: "Pastry Corner",
      description: "Freshly baked butter croissants, fruit tarts, and Belgian chocolate brownies prepared daily.",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Fairy-Lit Garden Terrace",
      location: "Outdoor Patio",
      description: "Open-air wooden deck surrounded by tropical greenery, ideal for evening conversations and date nights.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold tracking-widest text-[var(--color-cafe-primary)] uppercase bg-[var(--color-cafe-primary)]/10 px-3.5 py-1.5 rounded-full">
              Our Story & Heritage
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-gradient mt-4 mb-6">About Velvet Brews</h1>
            <p className="max-w-3xl mx-auto text-lg text-[var(--color-cafe-text-secondary)] leading-relaxed">
              Crafting memorable coffee moments in the heart of Surat. Born from a passion for authentic specialty coffee, warm interiors, and comforting food.
            </p>
          </motion.div>
        </section>

        {/* Story & Coffee Craft Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80" 
                alt="Velvet Brews Cafe Main Interior" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white text-xs font-semibold">
                📍 Vesu, Surat, Gujarat 395007
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-[var(--color-cafe-primary)] text-xs font-bold">
                <Sparkles className="h-4 w-4" /> Sustainable & Local
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-cafe-text-primary)]">
                Pure Passion, Estate-Direct Beans
              </h2>
              <p className="text-[var(--color-cafe-text-secondary)] text-base leading-relaxed">
                We source our coffee beans directly from sustainable shade-grown estates in Coorg and Chikmagalur, roasted in micro-batches to preserve every note of berry, chocolate, and spice.
              </p>
              <p className="text-[var(--color-cafe-text-secondary)] text-base leading-relaxed">
                Whether you're stopping by for a morning Flat White, an artisan sourdough pizza, or a quiet evening with green tea, our spaces are crafted to make you feel right at home.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Cafe Ambiance & Interiors Photography Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-cafe-primary)] bg-[var(--color-cafe-primary)]/10 px-3.5 py-1 rounded-full mb-3">
              <Camera className="h-3.5 w-3.5" /> Visual Tour
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-cafe-text-primary)]">
              Our Cafe Spaces & Ambiance
            </h2>
            <p className="mt-3 text-sm text-[var(--color-cafe-text-secondary)]">
              Every corner of Velvet Brews is thoughtfully curated with warm lighting, natural woods, and cozy nooks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ambianceSpaces.map((space, idx) => (
              <motion.div
                key={space.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={space.image}
                    alt={space.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {space.location}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[var(--color-cafe-text-primary)] mb-2 group-hover:text-[var(--color-cafe-primary)] transition-colors">
                      {space.title}
                    </h3>
                    <p className="text-xs text-[var(--color-cafe-text-secondary)] leading-relaxed">
                      {space.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/ambiance">
              <Button className="rounded-full px-8 gap-2 shadow-md">
                <Camera className="h-4 w-4" /> Explore All 12+ Cafe Ambiance Spaces →
              </Button>
            </Link>
          </div>
        </section>

        {/* Values Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-[var(--color-cafe-text-primary)]">Why Guest Love Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Specialty Roasts", desc: "Single-origin beans roasted to golden perfection.", icon: Coffee },
              { title: "Crafted with Love", desc: "50 freshly prepared dishes & artisan drinks.", icon: Heart },
              { title: "Award Winning", desc: "Voted #1 cozy cafe ambiance in Surat.", icon: Award },
              { title: "Cozy Community", desc: "A warm space for work, dates, & catchups.", icon: Users },
            ].map((item) => (
              <Card key={item.title} className="p-6 text-center glass-panel border-transparent hover:border-[var(--color-cafe-primary)]/30 transition-all">
                <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[var(--color-cafe-text-primary)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--color-cafe-text-secondary)] leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};
