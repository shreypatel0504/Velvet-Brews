import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Calendar, ArrowRight, Eye, X, Sun, Wifi, Coffee } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Card, Button } from "@/components/ui";

interface AmbianceZone {
  id: string;
  title: string;
  category: "indoor" | "outdoor" | "lounge";
  location: string;
  description: string;
  image: string;
  tag: string;
  capacity: string;
  lighting: string;
  features: string[];
}

const REALISTIC_ZONES: AmbianceZone[] = [
  {
    id: "zone-1",
    title: "The Main Espresso Bar",
    category: "indoor",
    location: "Ground Level Bar",
    description: "Our core coffee sanctuary featuring warm wooden accents, warm 2700K ambient lights, and live espresso crafting.",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=85",
    tag: "Espresso Bar",
    capacity: "20 Seats",
    lighting: "Warm Amber 2700K",
    features: ["Live Barista Crafting", "Aroma Counter", "Comfortable Bar Seating"]
  },
  {
    id: "zone-2",
    title: "Fairy-Lit Outdoor Garden Patio",
    category: "outdoor",
    location: "Outdoor Patio Deck",
    description: "An open-air wooden deck surrounded by lush palms and glowing fairy lights, perfect for evening dates and catchups.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85",
    tag: "Garden Patio",
    capacity: "30 Seats",
    lighting: "Fairy String Lights",
    features: ["Open Air Breeze", "Romantic Lighting", "Pet Friendly Area"]
  },
  {
    id: "zone-3",
    title: "Mezzanine Leather Work & Reading Lounge",
    category: "lounge",
    location: "Upper Mezzanine",
    description: "Quiet corners with ergonomic leather armchairs, floor lamps, power outlets, and high-speed fiber Wi-Fi.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=85",
    tag: "Quiet Work Lounge",
    capacity: "16 Seats",
    lighting: "Soft Desk Lamps",
    features: ["High-Speed Wi-Fi", "Dedicated Power Outlets", "Quiet Atmosphere"]
  },
  {
    id: "zone-4",
    title: "Sunlit Glass Window Booths",
    category: "indoor",
    location: "Street-Facing Glass Front",
    description: "Floor-to-ceiling glass booths offering natural morning sunlight and street views of Vesu boulevard.",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1600&q=85",
    tag: "Sunlit Booths",
    capacity: "12 Seats",
    lighting: "Natural Daylight",
    features: ["Natural Sunlight", "Boulevard Views", "Plush Cushioned Seating"]
  }
];

export const AmbiancePage = () => {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [selectedZone, setSelectedZone] = React.useState<AmbianceZone | null>(null);

  const filteredZones = REALISTIC_ZONES.filter((z) => {
    if (activeCategory === "all") return true;
    return z.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* HERO SECTION */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <span className="text-xs font-bold tracking-widest text-[var(--color-cafe-primary)] uppercase bg-[var(--color-cafe-primary)]/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" /> Cafe Ambiance & Interior
            </span>
            
            <h1 className="font-heading text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Experience Our Cafe Vibe
            </h1>
            
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-[var(--color-cafe-text-secondary)] leading-relaxed">
              Step into Velvet Brews — featuring warm ambient lighting, handcrafted wooden finishes, fairy-lit garden terraces, and cozy leather work lounges.
            </p>
          </motion.div>
        </section>

        {/* MINIMAL FILTER TABS */}
        <section className="max-w-4xl mx-auto px-4 mb-10">
          <div className="flex items-center justify-center gap-2">
            {[
              { id: "all", label: "All Spaces" },
              { id: "indoor", label: "Espresso Bar" },
              { id: "outdoor", label: "Garden Patio" },
              { id: "lounge", label: "Reading Lounge" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeCategory === tab.id
                    ? "bg-[var(--color-cafe-primary)] text-white border-transparent shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* 4 CURATED AMBIANCE CARDS */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredZones.map((zone, idx) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="group h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {/* Photo Container */}
                  <div className="relative h-72 overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setSelectedZone(zone)}>
                    <img
                      src={zone.image}
                      alt={zone.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      📍 {zone.location}
                    </span>

                    <span className="absolute top-3 right-3 bg-[var(--color-cafe-primary)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {zone.tag}
                    </span>

                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                      <span className="text-xs font-semibold">{zone.capacity}</span>
                      <button
                        onClick={() => setSelectedZone(zone)}
                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md text-white transition-colors"
                        title="View Fullscreen Photo"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                        {zone.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {zone.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                      {zone.features.map((feat) => (
                        <span key={feat} className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>

                    <Button
                      onClick={() => setSelectedZone(zone)}
                      variant="outline"
                      className="w-full text-xs gap-2 rounded-xl group-hover:bg-[var(--color-cafe-primary)] group-hover:text-white transition-colors"
                    >
                      View Photo & Details <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SIMPLE FEATURES GRID */}
        <section className="bg-white py-14 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-8">
              Cafe Ambiance Highlights
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 text-center">
                <Coffee className="h-6 w-6 text-[var(--color-cafe-primary)] mx-auto mb-2" />
                <h4 className="font-bold text-sm text-gray-900 mb-1">Warm Ambient Lighting</h4>
                <p className="text-xs text-gray-600">Soft 2700K amber glow created for cozy evening conversations.</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 text-center">
                <Sun className="h-6 w-6 text-[var(--color-cafe-primary)] mx-auto mb-2" />
                <h4 className="font-bold text-sm text-gray-900 mb-1">Open Outdoor Terrace</h4>
                <p className="text-xs text-gray-600">Fairy-lit garden patio surrounded by tropical monstera palms.</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 text-center">
                <Wifi className="h-6 w-6 text-[var(--color-cafe-primary)] mx-auto mb-2" />
                <h4 className="font-bold text-sm text-gray-900 mb-1">Work & Reading Lounge</h4>
                <p className="text-xs text-gray-600">Equipped with 300Mbps fiber Wi-Fi and power outlets under armchairs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="max-w-4xl mx-auto px-4 py-14 text-center">
          <div className="p-8 sm:p-10 bg-gradient-to-r from-[var(--color-cafe-primary)] to-amber-900 text-white rounded-3xl shadow-xl space-y-4">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">
              Visit Velvet Brews Surat
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl mx-auto">
              Reserve your favourite table in advance or drop by to enjoy fresh coffees and artisan pizzas.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link to="/reservation">
                <Button className="bg-white text-[var(--color-cafe-primary)] hover:bg-gray-100 font-bold px-6 text-xs rounded-full">
                  <Calendar className="h-3.5 w-3.5" /> Book Table
                </Button>
              </Link>
              <Link to="/menu">
                <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 text-xs rounded-full">
                  View Menu
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedZone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedZone(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl z-10 overflow-hidden border border-gray-100"
            >
              <div className="relative h-72 sm:h-80">
                <img
                  src={selectedZone.image}
                  alt={selectedZone.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedZone(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-bold bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedZone.tag}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-gray-900 mt-2">{selectedZone.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">📍 {selectedZone.location} • {selectedZone.capacity}</p>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedZone.description}
                </p>

                <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl">
                  <span className="font-medium text-gray-600">Lighting: <strong>{selectedZone.lighting}</strong></span>
                  <span className="font-medium text-gray-600">Capacity: <strong>{selectedZone.capacity}</strong></span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={() => setSelectedZone(null)} variant="outline" className="w-full text-xs">
                    Close
                  </Button>
                  <Link to="/reservation" className="w-full">
                    <Button className="w-full text-xs font-bold gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Book Table
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default AmbiancePage;
