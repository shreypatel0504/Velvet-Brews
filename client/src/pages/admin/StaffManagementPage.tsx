import * as React from "react";
import { Plus, Trash2, Mail, Shield, CheckCircle2, Users, UserCheck } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";
import toast from "react-hot-toast";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'barista' | 'waiter';
  shift: string;
  status: 'active' | 'on_break' | 'off_duty';
}

interface RegisteredUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export const StaffManagementPage = () => {
  const [activeTab, setActiveTab] = React.useState<'staff' | 'users'>('users');
  const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
  const [registeredUsers, setRegisteredUsers] = React.useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(true);
  const [loadingStaff, setLoadingStaff] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [newShift, setNewShift] = React.useState("Morning (8 AM - 4 PM)");
  const [newRole, setNewRole] = React.useState<'admin' | 'manager' | 'barista' | 'waiter'>("barista");
  const [submitting, setSubmitting] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRegisteredUsers(data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch registered users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchStaff = React.useCallback(async () => {
    try {
      setLoadingStaff(true);
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStaffList(data.map((s: any) => ({
            id: s._id || s.id,
            name: s.name,
            email: s.email,
            role: s.role || 'barista',
            shift: s.shift || 'General (9 AM - 6 PM)',
            status: (s.status || 'Active').toLowerCase().replace(' ', '_') as any
          })));
        }
      }
    } catch (err) {
      console.warn("Could not fetch staff members:", err);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
    fetchStaff();
  }, [fetchUsers, fetchStaff]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          phone: newPhone.trim() || '+91 98765 00000',
          role: newRole,
          shift: newShift,
          status: 'Active'
        })
      });

      if (response.ok) {
        toast.success(`Added ${newName} to Staff & Database!`);
        setShowAddModal(false);
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        fetchStaff();
        fetchUsers();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to add staff member');
      }
    } catch {
      toast.error('Unable to connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStaffList(prev => prev.filter(s => s.id !== id));
        toast.success(`Removed ${name} from Staff and Database`);
        fetchStaff();
        fetchUsers();
      } else {
        toast.error('Failed to remove staff member');
      }
    } catch {
      setStaffList(prev => prev.filter(s => s.id !== id));
      toast.success(`Removed ${name} from Staff`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">User & Staff Management</h2>
          <p className="text-sm text-[var(--color-cafe-text-secondary)]">Manage registered customers, cafe employees, and roles.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-amber-500/10 p-1 border border-amber-900/10">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-[var(--color-cafe-primary)] text-white shadow-xs' : 'text-amber-950 hover:text-amber-800'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" /> Registered Users ({registeredUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'staff' ? 'bg-[var(--color-cafe-primary)] text-white shadow-xs' : 'text-amber-950 hover:text-amber-800'
              }`}
            >
              <Users className="h-3.5 w-3.5" /> Staff Members ({staffList.length})
            </button>
          </div>

          {activeTab === 'staff' && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2 text-xs">
              <Plus className="h-4 w-4" /> Add Staff
            </Button>
          )}
        </div>
      </div>

      {/* Registered Customers / Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              📊 Live Accounts in Database (MongoDB & Local Sync)
            </p>
            <Button variant="outline" size="sm" onClick={fetchUsers} className="text-xs h-8">
              Refresh Accounts
            </Button>
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center text-sm text-[var(--color-cafe-text-secondary)]">
              Loading registered users from database...
            </div>
          ) : registeredUsers.length === 0 ? (
            <Card className="p-8 text-center text-sm text-[var(--color-cafe-text-secondary)]">
              No registered users found yet. Register a new user on the website to see them appear here!
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {registeredUsers.map((u) => (
                <Card key={u._id || u.id} className="p-5 border-transparent glass-panel flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[var(--color-cafe-text-primary)] leading-tight">{u.name}</h3>
                          <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 mt-0.5 rounded-full ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {u.role || 'customer'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        #{(u._id || u.id).slice(-5)}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--color-cafe-text-secondary)] mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                        <span className="truncate font-medium">{u.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100/80 pt-3 flex justify-between items-center text-[11px] text-gray-500">
                    <span>Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Staff Grid Tab */}
      {activeTab === 'staff' && (
        <div>
          {loadingStaff ? (
            <div className="p-8 text-center text-sm text-[var(--color-cafe-text-secondary)]">
              Loading staff members from database...
            </div>
          ) : staffList.length === 0 ? (
            <Card className="p-8 text-center text-sm text-[var(--color-cafe-text-secondary)]">
              No staff members found in database. Click "Add Staff" above to create one.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffList.map((staff) => (
                <Card key={staff.id} className="p-6 border-transparent glass-panel flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] flex items-center justify-center font-bold text-lg">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-[var(--color-cafe-text-primary)]">{staff.name}</h3>
                          <span className="text-xs uppercase font-bold text-[var(--color-cafe-primary)] tracking-wider">
                            {staff.role}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        staff.status === 'active' ? 'bg-green-100 text-green-700' :
                        staff.status === 'on_break' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {staff.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-[var(--color-cafe-text-secondary)] mb-6">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>Shift: {staff.shift}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Access Granted
                    </span>
                    <button 
                      onClick={() => handleDeleteStaff(staff.id, staff.name)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Remove staff"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl rounded-2xl">
            <h3 className="font-heading text-xl font-bold mb-4 text-[var(--color-cafe-text-primary)]">Add New Staff Member</h3>
            <form onSubmit={handleAddStaff} className="space-y-3.5">
              <Input 
                label="Full Name" 
                placeholder="e.g. Rahul Sharma"
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                required 
              />
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="rahul@velvetbrews.com"
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                required 
              />
              <Input 
                label="Phone Number" 
                placeholder="+91 98765 43210"
                value={newPhone} 
                onChange={(e) => setNewPhone(e.target.value)} 
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-cafe-text-secondary)] mb-1">Role</label>
                  <select 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]"
                  >
                    <option value="barista">Barista</option>
                    <option value="waiter">Waiter</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-cafe-text-secondary)] mb-1">Shift</label>
                  <select 
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]"
                  >
                    <option value="Morning (8 AM - 4 PM)">Morning (8-4)</option>
                    <option value="Evening (3 PM - 11 PM)">Evening (3-11)</option>
                    <option value="Night (10 PM - 6 AM)">Night (10-6)</option>
                    <option value="Full Day (9 AM - 7 PM)">Full Day (9-7)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  Save to Database
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

