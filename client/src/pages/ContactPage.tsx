import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, User } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Card, Button, Input } from "@/components/ui";
import { socket } from "@/utils/socket";
import { sharedSync } from "@/utils/sharedSync";
import { trackWebsiteActivity } from "@/utils/activityTracker";
import toast from "react-hot-toast";

export const ContactPage = () => {
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    const contactPayload = {
      _id: 'MSG' + Math.floor(100 + Math.random() * 900),
      name,
      email,
      phone: phone || '+91 99000 00000',
      subject: subject || 'General Inquiry',
      message,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    // Save locally for instant cross-tab sync
    sharedSync.saveContact(contactPayload);

    // Track activity
    trackWebsiteActivity('contact_message', name, `Sent message: "${subject || message.slice(0, 30)}..."`);

    // Post to API & emit socket
    try {
      socket.connect();
      socket.emit('new-contact', contactPayload);

      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactPayload)
      });
    } catch {
      console.warn("Contact API fallback active");
    }

    setLoading(false);
    toast.success("Thank you! Your message has been sent directly to Velvet Brews Admin.");
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col justify-between">
      <div className="pb-24">
        <Navbar />

        <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold tracking-wider text-[var(--color-cafe-primary)] uppercase">Get In Touch</span>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-gradient mt-2 mb-4">Contact Velvet Brews</h1>
            <p className="max-w-xl mx-auto text-lg text-[var(--color-cafe-text-secondary)]">
              Have a question about our menu, table bookings, or hosting an event? We’d love to hear from you!
            </p>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Contact Details Side */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-8 glass-panel border-transparent shadow-[var(--shadow-cafe-card)]">
                <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)] mb-6">Contact Info</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[var(--color-cafe-text-primary)]">Cafe Owner</h4>
                      <p className="text-sm font-bold text-[var(--color-cafe-primary)] mt-1">
                        Shrey Patel
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[var(--color-cafe-text-primary)]">Visit Us</h4>
                      <p className="text-sm text-[var(--color-cafe-text-secondary)] mt-1">
                        102 VIP Road, Vesu, Surat, Gujarat 395007
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] shrink-0">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[var(--color-cafe-text-primary)]">Call Us</h4>
                      <p className="text-sm font-bold text-[var(--color-cafe-primary)] mt-1">
                        +91 99784 21542
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[var(--color-cafe-text-primary)]">Email Us</h4>
                      <p className="text-sm text-[var(--color-cafe-text-secondary)] mt-1">
                        hello@velvetbrews.in
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[var(--color-cafe-text-primary)]">Opening Hours</h4>
                      <p className="text-sm text-[var(--color-cafe-text-secondary)] mt-1">
                        Mon - Sun: 8:00 AM - 11:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form Side */}
            <div className="lg:col-span-7">
              <Card className="p-8 sm:p-10 glass-panel border-transparent shadow-[var(--shadow-cafe-card)]">
                <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)] mb-6">Send Us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                      label="Your Name" 
                      placeholder="Rahul Sharma" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                    <Input 
                      label="Email Address" 
                      type="email" 
                      placeholder="rahul@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                      label="Phone Number" 
                      placeholder="+91 99784 21542" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input 
                      label="Subject" 
                      placeholder="Inquiry / Event / Feedback" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-cafe-text-secondary)] mb-2">Message</label>
                    <textarea 
                      rows={4}
                      required
                      placeholder="Write your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 bg-white p-4 text-sm focus:border-[var(--color-cafe-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-cafe-primary)]"
                    />
                  </div>

                  <Button type="submit" isLoading={loading} className="w-full sm:w-auto h-12 px-8 gap-2 shadow-lg shadow-[var(--color-cafe-primary)]/20">
                    Send Message <Send className="h-4 w-4" />
                  </Button>
                </form>
              </Card>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};
