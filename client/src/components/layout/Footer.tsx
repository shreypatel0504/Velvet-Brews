import React from "react";
import { Link } from "react-router-dom";
import { Coffee, MapPin, Phone, Mail, Clock, Send, Heart, User } from "lucide-react";
import { socket } from "@/utils/socket";
import { sharedSync } from "@/utils/sharedSync";
import { trackWebsiteActivity } from "@/utils/activityTracker";
import toast from "react-hot-toast";

export const Footer = () => {
  const [email, setEmail] = React.useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    const subPayload = {
      _id: 'SUB' + Math.floor(1000 + Math.random() * 9000),
      email,
      createdAt: new Date().toISOString()
    };

    sharedSync.saveSubscriber(subPayload);
    trackWebsiteActivity('newsletter_subscribe', email, `Subscribed to newsletter updates`);

    try {
      socket.connect();
      socket.emit('new-subscriber', subPayload);

      await fetch('/api/contact/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch {
      // Catch fallback
    }

    toast.success("Subscribed to Velvet Brews newsletter!");
    setEmail("");
  };


  return (
    <footer className="bg-[var(--color-cafe-text-primary)] text-white pt-16 pb-12 border-t border-amber-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Coffee className="h-7 w-7 text-[var(--color-cafe-secondary)]" />
              <span className="font-heading text-2xl font-bold text-[var(--color-cafe-secondary)]">
                Velvet Brews
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Crafting premium Indian single-origin coffees, stone-baked sourdough pizzas, and gourmet treats in a cozy, modern ambience.
            </p>
            <div className="pt-1 text-xs text-amber-200/90 font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[var(--color-cafe-secondary)]" />
              <span>Owner & Founder: <strong>Shrey Patel</strong></span>
            </div>
            <div className="text-xs text-amber-200/80 flex items-center gap-1">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 fill-current text-red-400 inline" />
              <span>for coffee lovers.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-bold text-amber-200 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-[var(--color-cafe-secondary)] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[var(--color-cafe-secondary)] transition-colors">Our Menu</Link>
              </li>
              <li>
                <Link to="/ambiance" className="hover:text-[var(--color-cafe-secondary)] transition-colors text-amber-200">Cafe Ambiance ✨</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-[var(--color-cafe-secondary)] transition-colors">Customer Reviews ★</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[var(--color-cafe-secondary)] transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--color-cafe-secondary)] transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Address */}
          <div>
            <h4 className="font-heading text-lg font-bold text-amber-200 mb-4">Visit Us</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[var(--color-cafe-secondary)] shrink-0 mt-0.5" />
                <span>102 VIP Road, Vesu, Surat, Gujarat 395007</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[var(--color-cafe-secondary)] shrink-0" />
                <span>+91 99784 21542</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[var(--color-cafe-secondary)] shrink-0" />
                <span>hello@velvetbrews.in</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[var(--color-cafe-secondary)] shrink-0" />
                <span>Mon - Sun: 8:00 AM - 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-lg font-bold text-amber-200 mb-4">Stay Connected</h4>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to receive special offers, new menu launches, and exclusive rewards.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input 
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-4 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-cafe-secondary)]"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-cafe-secondary)] text-[var(--color-cafe-text-primary)] rounded-lg hover:bg-white transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Velvet Brews Cafe. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-200 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-200 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
