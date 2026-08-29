import React from "react";
import { Users, UserPlus, Search, Phone, Mail, Clock, DollarSign, Calendar, Edit2, Trash2, CheckCircle2, AlertCircle, X, RefreshCw, Filter, Sparkles, UserCheck } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { socket } from "../utils/socket";
import toast from "react-hot-toast";

interface StaffMember {
  _id: string;
  id?: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  shift: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  hourlyRate: number;
  avatar: string;
  emergencyContact?: string;
  joinedDate?: string;
}

const ROLES = [
  "Head Barista",
  "Senior Barista",
  "Barista Trainee",
  "Pastry Chef",
  "Sous Chef",
  "Floor Supervisor",
  "Cashier & Host",
  "Cafe Manager",
  "Kitchen Assistant"
];

const SHIFTS = [
  "Morning (6:00 AM - 2:00 PM)",
  "Morning (8:00 AM - 4:00 PM)",
  "General (9:00 AM - 5:00 PM)",
  "Evening (2:00 PM - 10:00 PM)",
  "Night (10:00 PM - 6:00 AM)"
];

interface StaffFormState {
  name: string;
  role: string;
  phone: string;
  email: string;
  shift: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  hourlyRate: number;
  emergencyContact: string;
  avatar: string;
}

const EMPTY_STAFF_FORM: StaffFormState = {
  name: '',
  role: 'Head Barista',
  phone: '',
  email: '',
  shift: 'Morning (8:00 AM - 4:00 PM)',
  status: 'Active',
  hourlyRate: 250,
  emergencyContact: '',
  avatar: ''
};

export const StaffManagementPage = () => {
  const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null);
  const [form, setForm] = React.useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [saving, setSaving] = React.useState(false);

  const fetchStaff = React.useCallback(async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (Array.isArray(data)) {
        setStaffList(data);
      }
    } catch {
      console.warn("Failed to load staff list from backend API");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStaff();
    socket.connect();

    socket.on('staff-added', (newStaff: StaffMember) => {
      setStaffList(prev => [newStaff, ...prev.filter(s => (s._id || s.id) !== (newStaff._id || newStaff.id))]);
      toast.success(`👤 New Staff Added: ${newStaff.name} (${newStaff.role})`);
    });

    socket.on('staff-updated', (updated: StaffMember) => {
      setStaffList(prev => prev.map(s => (s._id === updated._id || s._id === updated.id) ? { ...s, ...updated } : s));
    });

    socket.on('staff-deleted', (payload: { _id: string }) => {
      setStaffList(prev => prev.filter(s => s._id !== payload._id && s.id !== payload._id));
    });

    return () => {
      socket.off('staff-added');
      socket.off('staff-updated');
      socket.off('staff-deleted');
      socket.disconnect();
    };
  }, [fetchStaff]);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setForm(EMPTY_STAFF_FORM);
    setShowModal(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setForm({
      name: staff.name,
      role: staff.role,
      phone: staff.phone,
      email: staff.email,
      shift: staff.shift,
      status: staff.status,
      hourlyRate: staff.hourlyRate || 250,
      emergencyContact: staff.emergencyContact || '',
      avatar: staff.avatar || ''
    });
    setShowModal(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      toast.error("Please enter staff name, phone number, and email");
      return;
    }

    setSaving(true);
    try {
      const url = editingStaff 
        ? `http://localhost:5000/api/staff/${editingStaff._id || editingStaff.id}`
        : 'http://localhost:5000/api/staff';

      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Failed to save");

      const savedData = await res.json();
      toast.success(editingStaff ? `✅ Staff updated: ${savedData.name}` : `🎉 Staff member added: ${savedData.name}!`);

      setShowModal(false);
      fetchStaff();
    } catch {
      toast.error("Error saving staff details");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (staff: StaffMember, nextStatus: 'Active' | 'On Leave' | 'Inactive') => {
    try {
      const targetId = staff._id || staff.id;
      const res = await fetch(`http://localhost:5000/api/staff/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setStaffList(prev => prev.map(s => (s._id === targetId || s.id === targetId) ? { ...s, status: nextStatus } : s));
        toast.success(`Status changed to ${nextStatus} for ${staff.name}`);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) return;
    try {
      await fetch(`http://localhost:5000/api/staff/${id}`, { method: 'DELETE' });
      setStaffList(prev => prev.filter(s => s._id !== id && s.id !== id));
      toast.success(`Staff member "${name}" removed`);
    } catch {
      toast.error("Failed to delete staff member");
    }
  };

  // Filtered List
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "all" || staff.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || staff.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats Calculations
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(s => s.status === 'Active').length;
  const onLeaveStaff = staffList.filter(s => s.status === 'On Leave').length;
  const totalMonthlyPayroll = staffList.reduce((sum, s) => sum + ((s.hourlyRate || 250) * 8 * 26), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--color-cafe-primary)]" /> Staff & Shift Roster Management
          </h2>
          <p className="text-sm text-gray-500">
            Manage baristas, chefs, floor supervisors, shifts & payroll estimates in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStaff}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <Button onClick={handleOpenAddModal} className="gap-2 shadow-md">
            <UserPlus className="h-4 w-4" /> Add Staff Member
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-xs border-amber-100 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>Total Staff</span>
            <Users className="h-4 w-4 text-[var(--color-cafe-primary)]" />
          </div>
          <p className="text-3xl font-black text-gray-900">{totalStaff}</p>
          <span className="text-[11px] text-gray-400 font-medium">Registered Team Members</span>
        </Card>

        <Card className="p-4 bg-emerald-50/50 border-emerald-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold uppercase">
            <span>Active On Duty</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-800">{activeStaff}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Working Shifts Today</span>
        </Card>

        <Card className="p-4 bg-amber-50/60 border-amber-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold uppercase">
            <span>On Leave</span>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-800">{onLeaveStaff}</p>
          <span className="text-[11px] text-amber-600 font-medium">Rest Day / Approved Leave</span>
        </Card>

        <Card className="p-4 bg-blue-50/50 border-blue-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold uppercase">
            <span>Monthly Payroll</span>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-900">₹{totalMonthlyPayroll.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-blue-600 font-medium">Estimated Monthly Wage</span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by staff name, role, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-cafe-primary)]"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-[var(--color-cafe-primary)]"
          >
            <option value="all">All Roles ({staffList.length})</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-[var(--color-cafe-primary)]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active Only</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredStaff.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50 border-dashed">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-700">No Staff Members Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            No team members matched your search criteria. Click below to add a new staff member.
          </p>
          <Button onClick={handleOpenAddModal} className="mt-4 gap-2 text-xs">
            <UserPlus className="h-4 w-4" /> Add Staff Member
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => {
            const monthlySalary = (staff.hourlyRate || 250) * 8 * 26;
            return (
              <Card
                key={staff._id || staff.id}
                className="p-6 bg-white border-2 border-amber-100/80 hover:border-amber-300 transition-all shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Avatar & Status Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staff.name)}`}
                          alt={staff.name}
                          className="w-14 h-14 rounded-2xl object-cover bg-amber-50 border-2 border-amber-200 shadow-xs"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            staff.status === 'Active' ? 'bg-emerald-500' :
                            staff.status === 'On Leave' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          title={`Status: ${staff.status}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-snug">{staff.name}</h3>
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-[var(--color-cafe-primary)] border border-amber-200/80">
                          {staff.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(staff)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Staff Member"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff._id || staff.id || '', staff.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Staff Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="space-y-2 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[var(--color-cafe-primary)]" /> Shift Roster:
                      </span>
                      <span className="font-bold text-gray-800">{staff.shift}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-blue-500" /> Phone Contact:
                      </span>
                      <a href={`tel:${staff.phone}`} className="font-bold text-blue-600 hover:underline">{staff.phone}</a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-purple-500" /> Email Address:
                      </span>
                      <a href={`mailto:${staff.email}`} className="font-medium text-gray-700 truncate max-w-[150px]">{staff.email}</a>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200/60 pt-2 mt-2">
                      <span className="text-gray-400">Hourly Rate / Wage:</span>
                      <span className="font-bold text-emerald-700">₹{staff.hourlyRate || 250} / hr (~₹{monthlySalary.toLocaleString('en-IN')}/mo)</span>
                    </div>

                    {staff.emergencyContact && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Emergency Call:</span>
                        <span className="font-bold text-gray-700">{staff.emergencyContact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Switcher Footer */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-gray-400">Status:</span>
                  <div className="flex items-center gap-1">
                    {(['Active', 'On Leave', 'Inactive'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => handleToggleStatus(staff, st)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          staff.status === st
                            ? st === 'Active' ? 'bg-emerald-600 text-white border-transparent'
                              : st === 'On Leave' ? 'bg-amber-500 text-white border-transparent'
                              : 'bg-red-600 text-white border-transparent'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-gray-900">
                  {editingStaff ? "Edit Staff Details" : "Add New Staff Member"}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingStaff ? "Update barista or employee shift and contact info." : "Enter staff member details to add to Velvet Brews roster."}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Vikramaditya Singh"
                    value={form.name}
                    onChange={(e: any) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Staff Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Input
                    label="Phone Number *"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="staff@velvetbrews.com"
                    value={form.email}
                    onChange={(e: any) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Shift Roster *</label>
                  <select
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  >
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Input
                    label="Hourly Rate (₹/hr)"
                    type="number"
                    placeholder="250"
                    value={form.hourlyRate}
                    onChange={(e: any) => setForm({ ...form, hourlyRate: Number(e.target.value) })}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Initial Status</label>
                  <select
                    value={form.status}
                    onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  >
                    <option value="Active">Active (On Duty)</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <Input
                    label="Emergency Contact Phone"
                    placeholder="+91 99000 11223 (Family / Relative)"
                    value={form.emergencyContact}
                    onChange={(e: any) => setForm({ ...form, emergencyContact: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="w-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {saving ? "Saving..." : editingStaff ? "Update Staff" : "Add Staff Member"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
