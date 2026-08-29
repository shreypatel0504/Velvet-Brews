import React from "react";
import { Mail, MessageSquare, CheckCircle2, Clock, Send, Download, Search, RefreshCw, User, Phone, Check, ShieldCheck, Sparkles, Filter } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { socket } from "../utils/socket";
import { sharedSync } from "../utils/sharedSync";
import toast from "react-hot-toast";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  reply?: string;
  createdAt: string;
}

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export const InquiriesManagementPage = () => {
  const [activeTab, setActiveTab] = React.useState<'messages' | 'subscribers'>('messages');
  const [messages, setMessages] = React.useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Reply Modal state
  const [selectedMessage, setSelectedMessage] = React.useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const [msgRes, subRes] = await Promise.all([
        fetch('/api/contact').then(r => r.json()).catch(() => []),
        fetch('/api/contact/subscribers').then(r => r.json()).catch(() => [])
      ]);

      const apiMsgs = Array.isArray(msgRes) ? msgRes : [];
      const localMsgs = sharedSync.getContacts();
      const mergedMsgs: any[] = [...apiMsgs];
      localMsgs.forEach(lm => {
        if (!mergedMsgs.some(m => m._id === lm._id)) {
          mergedMsgs.unshift(lm);
        }
      });

      const apiSubs = Array.isArray(subRes) ? subRes : [];
      const localSubs = sharedSync.getSubscribers();
      const mergedSubs: any[] = [...apiSubs];
      localSubs.forEach(ls => {
        if (!mergedSubs.some(s => s.email.toLowerCase() === ls.email.toLowerCase())) {
          mergedSubs.unshift(ls);
        }
      });

      setMessages(mergedMsgs);
      setSubscribers(mergedSubs);
    } catch {
      setMessages(sharedSync.getContacts() as any);
      setSubscribers(sharedSync.getSubscribers() as any);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    socket.connect();

    socket.on('new-contact', (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [msg, ...prev];
      });
      toast.success(`💬 New Message from ${msg.name || 'Visitor'}!`, { duration: 5000 });
    });

    socket.on('contact-updated', (updated: any) => {
      setMessages(prev => prev.map(m => m._id === updated._id ? { ...m, ...updated } : m));
    });

    socket.on('new-subscriber', (sub: any) => {
      setSubscribers(prev => {
        if (prev.some(s => s.email.toLowerCase() === sub.email.toLowerCase())) return prev;
        return [sub, ...prev];
      });
      toast.success(`📧 New Newsletter Subscriber: ${sub.email}`, { duration: 5000 });
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchData();
    });

    return () => {
      socket.off('new-contact');
      socket.off('contact-updated');
      socket.off('new-subscriber');
      unsubscribeStorage();
    };
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'replied' | 'resolved', reply?: string) => {
    const payload = { status: newStatus, reply };
    setMessages(prev => prev.map(m => m._id === id ? { ...m, status: newStatus, reply } : m));

    const item = messages.find(m => m._id === id);
    if (item) {
      sharedSync.saveContact({ ...item, status: newStatus, reply });
    }

    try {
      socket.emit('contact-updated', { _id: id, ...payload });
      await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Fallback
    }

    toast.success(`Message marked as ${newStatus}`);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setIsSending(true);
    await handleUpdateStatus(selectedMessage._id, 'replied', replyText);
    setIsSending(false);
    setSelectedMessage(null);
    setReplyText("");
  };

  const handleExportCSV = () => {
    const headers = "Email,Subscribed Date\n";
    const rows = subscribers.map(s => `"${s.email}","${new Date(s.createdAt).toLocaleDateString()}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velvet_brews_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Subscribers list exported as CSV!");
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = (m.name + m.email + m.subject + m.message).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900">Inquiries & Subscribers</h2>
          <p className="text-sm text-gray-500">Monitor messages sent from your website Contact form & newsletter signups in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          {activeTab === 'subscribers' && (
            <Button onClick={handleExportCSV} className="gap-2 bg-[var(--color-cafe-primary)] text-white">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 gap-8">
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'messages'
              ? 'border-[var(--color-cafe-primary)] text-[var(--color-cafe-primary)]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Contact Messages
          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
            {messages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'subscribers'
              ? 'border-[var(--color-cafe-primary)] text-[var(--color-cafe-primary)]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Mail className="h-4 w-4" />
          Newsletter Subscribers
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
            {subscribers.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'messages' ? "Search message, name, email..." : "Search subscriber email..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-cafe-primary)]"
          />
        </div>

        {activeTab === 'messages' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-cafe-primary)] bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="replied">Replied</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        )}
      </div>

      {/* MESSAGES TAB CONTENT */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <Card className="p-12 text-center text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-600">No contact messages found</p>
              <p className="text-xs text-gray-400 mt-1">Messages submitted from your website contact form will appear here in real-time.</p>
            </Card>
          ) : (
            filteredMessages.map((msg) => (
              <Card key={msg._id} className="p-6 border-gray-100 hover:shadow-md transition-shadow space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                      {msg.name ? msg.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        {msg.name}
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          msg.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          msg.status === 'replied' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {msg.status}
                        </span>
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {msg.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(msg.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-sm text-gray-800 mb-1">Subject: {msg.subject}</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed">
                    "{msg.message}"
                  </p>
                </div>

                {msg.reply && (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" /> Cafe Owner Reply:
                    </span>
                    <p className="text-emerald-900">{msg.reply}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <Button
                    onClick={() => { setSelectedMessage(msg); setReplyText(msg.reply || ""); }}
                    variant="outline"
                    className="text-xs gap-1.5 border-gray-200"
                  >
                    <Send className="h-3.5 w-3.5 text-[var(--color-cafe-primary)]" />
                    {msg.reply ? "Edit Reply" : "Reply to Customer"}
                  </Button>

                  {msg.status !== 'resolved' && (
                    <Button
                      onClick={() => handleUpdateStatus(msg._id, 'resolved')}
                      className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* SUBSCRIBERS TAB CONTENT */}
      {activeTab === 'subscribers' && (
        <Card className="p-6 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900">Email Subscribers ({filteredSubscribers.length})</h3>
            <span className="text-xs text-gray-500">Auto-captured from footer & popups</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Subscribed On</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No newsletter subscribers yet.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub, idx) => (
                    <tr key={sub._id || idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[var(--color-cafe-primary)] shrink-0" />
                        {sub.email}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {new Date(sub.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          <Check className="h-3 w-3" /> Active Subscriber
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPLY MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="w-full max-w-lg p-6 bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Reply to {selectedMessage.name}</h3>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600">
              <span className="font-bold block text-gray-800 mb-1">Subject: {selectedMessage.subject}</span>
              <p>"{selectedMessage.message}"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Response / Answer</label>
              <textarea
                rows={4}
                placeholder="Type your official reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-cafe-primary)]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>Cancel</Button>
              <Button onClick={handleSendReply} isLoading={isSending} className="bg-[var(--color-cafe-primary)] text-white gap-2">
                <Send className="h-4 w-4" /> Send Reply
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
