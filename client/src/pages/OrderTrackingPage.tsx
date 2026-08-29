import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Coffee, Utensils, ArrowLeft, Home, Star, Sparkles, Printer } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { Navbar } from "@/components/layout";
import { FeedbackModal, FeedbackForm } from "@/components/modals";
import { socket } from "@/utils/socket";
import toast from "react-hot-toast";

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const [statusIndex, setStatusIndex] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [hasPoppedServedFeedback, setHasPoppedServedFeedback] = React.useState(false);
  
  React.useEffect(() => {
    socket.connect();

    const fetchInitialStatus = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const orders = await res.json();
          if (Array.isArray(orders)) {
            const cleanTarget = String(id || '').replace(/[^0-9a-zA-Z]/g, '');
            const found = orders.find(o => {
              const cleanId = String(o._id || o.id || '').replace(/[^0-9a-zA-Z]/g, '');
              return cleanId && cleanTarget && (cleanId.endsWith(cleanTarget) || cleanTarget.endsWith(cleanId));
            });
            if (found && found.status) {
              const statusMap: Record<string, number> = { 'pending': 0, 'preparing': 1, 'ready': 2, 'served': 3 };
              if (statusMap[found.status] !== undefined) {
                setStatusIndex(statusMap[found.status]);
              }
            } else {
              // Default to step 1 (Preparing) if order is newly placed
              setStatusIndex(1);
            }
          }
        }
      } catch {
        setStatusIndex(1);
      }
    };

    fetchInitialStatus();

    socket.on('order-updated', (order: any) => {
      const cleanOrderId = String(order._id || order.id || '').replace(/[^0-9a-zA-Z]/g, '');
      const cleanCurrentId = String(id || '').replace(/[^0-9a-zA-Z]/g, '');

      if (!cleanOrderId || !cleanCurrentId || cleanOrderId.endsWith(cleanCurrentId) || cleanCurrentId.endsWith(cleanOrderId)) {
        const statusMap: Record<string, number> = { 'pending': 0, 'preparing': 1, 'ready': 2, 'served': 3 };
        if (statusMap[order.status] !== undefined) {
          const newIdx = statusMap[order.status];
          setStatusIndex(newIdx);
          
          if (newIdx === 2) {
            toast.success("☕ Order is READY! Please collect or enjoy your table service.");
          } else if (newIdx === 3 && !hasPoppedServedFeedback) {
            setHasPoppedServedFeedback(true);
            setTimeout(() => {
              setIsModalOpen(true);
              toast.success("🎉 Order Served! Please share your feedback.");
            }, 800);
          }
        }
      }
    });

    return () => {
      socket.off('order-updated');
      socket.disconnect();
    };
  }, [id, hasPoppedServedFeedback]);

  const steps = [
    { title: "Order Placed & Paid", description: "Payment verified. Order sent to kitchen", icon: CheckCircle2 },
    { title: "Preparing Food", description: "Our baristas and chefs are preparing your items", icon: Utensils },
    { title: "Ready for Table / Pickup", description: "Order is cooked fresh & packaged", icon: Coffee },
    { title: "Order Served & Completed", description: "Food served to your table / delivered!", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col">
      <Navbar />
      
      {/* Pop-up Feedback Modal Triggered ONLY After Order Served / Completed */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderId={id}
      />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
              statusIndex === 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <CheckCircle2 className="h-10 w-10" />
          </motion.div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200">
            <Sparkles className="h-3.5 w-3.5" /> Payment Successful • ₹ Confirmed
          </div>

          <h1 className="font-heading text-3xl font-bold text-[var(--color-cafe-text-primary)] mb-1">
            {statusIndex === 3 ? "Order Served & Completed!" : "Order Being Prepared"}
          </h1>
          <p className="text-xs text-[var(--color-cafe-text-secondary)] font-semibold">Order #{id || '1026'}</p>

          {/* Live Kitchen Prep Timer */}
          {statusIndex < 3 && (
            <div className="mt-4 bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl max-w-xs mx-auto text-amber-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
              <span>👨‍🍳 Chef & Barista Prep Time: <strong>Est. {Math.max(1, 12 - statusIndex * 4)} Mins Remaining</strong></span>
            </div>
          )}

          {/* Trigger button for manual feedback */}
          {statusIndex === 3 && (
            <div className="mt-4">
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-2 rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
              >
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> Give Food & Vibe Feedback
              </Button>
            </div>
          )}
        </div>

        <Card className="p-6 md:p-10 border-transparent shadow-[var(--shadow-cafe-card)] bg-white">
          <h2 className="font-heading text-xl font-bold mb-8 text-center text-gray-800">Live Order Progress</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-100 hidden sm:block"></div>
            <motion.div 
              className="absolute left-8 top-8 w-0.5 bg-[var(--color-cafe-primary)] hidden sm:block"
              initial={{ height: 0 }}
              animate={{ height: `${(statusIndex / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />

            <div className="space-y-8">
              {steps.map((step, idx) => {
                const isActive = idx <= statusIndex;
                const isCurrent = idx === statusIndex;
                
                return (
                  <div key={idx} className="flex items-start gap-6 relative z-10">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.15 }}
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isActive 
                          ? 'bg-[var(--color-cafe-primary)] text-white shadow-[var(--color-cafe-primary)]/30' 
                          : 'bg-white text-gray-300 border-2 border-gray-100'
                      }`}
                    >
                      <step.icon className={`h-7 w-7 ${isCurrent ? 'animate-pulse' : ''}`} />
                    </motion.div>
                    
                    <div className={`pt-2 ${isActive ? 'text-[var(--color-cafe-text-primary)]' : 'text-gray-400'}`}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{step.title}</h3>
                        {idx === 3 && statusIndex === 3 && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Feedback Section (Visible after Order Served) */}
        {statusIndex === 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <FeedbackForm orderId={id} />
          </motion.div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              const win = window.open("", "_blank");
              if (!win) return;
              win.document.write(`
                <html>
                  <head><title>Velvet Brews Invoice #${id || '1026'}</title></head>
                  <body style="font-family:sans-serif; padding:20px; max-width:400px; margin:auto;">
                    <h2 style="color:#8C6239; margin-bottom:4px;">VELVET BREWS CAFE</h2>
                    <p style="font-size:12px; color:#555;">102 VIP Road, Vesu, Surat • GSTIN: 24AAACV1234F1Z9</p>
                    <hr>
                    <p style="font-size:13px;"><strong>Order ID:</strong> #${id || '1026'}<br><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                    <table style="width:100%; font-size:12px; border-collapse:collapse;">
                      <tr style="border-bottom:1px solid #ccc;"><th style="text-align:left;">Item</th><th style="text-align:right;">Total</th></tr>
                      <tr><td>1x Velvet Special Cold Brew</td><td style="text-align:right;">₹210.00</td></tr>
                      <tr><td>1x Margherita Pizza</td><td style="text-align:right;">₹340.00</td></tr>
                    </table>
                    <hr>
                    <p style="font-size:13px; text-align:right;"><strong>Subtotal:</strong> ₹550.00<br><strong>GST (5%):</strong> ₹27.50<br><span style="font-size:15px; font-weight:bold;">Total Paid: ₹577.50</span></p>
                    <p style="text-align:center; font-size:11px; color:#888;">Thank you for dining with Velvet Brews!</p>
                    <script>window.onload = function() { window.print(); }</script>
                  </body>
                </html>
              `);
              win.document.close();
            }}
            variant="outline"
            className="gap-2 rounded-xl text-xs font-bold"
          >
            <Printer className="h-4 w-4" /> Print Digital Invoice
          </Button>

          <Link to="/menu">
            <Button variant="outline" className="gap-2 text-xs font-bold rounded-xl"><ArrowLeft className="h-4 w-4" /> Back to Menu</Button>
          </Link>
          <Link to="/">
            <Button className="gap-2 text-xs font-bold rounded-xl"><Home className="h-4 w-4" /> Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
