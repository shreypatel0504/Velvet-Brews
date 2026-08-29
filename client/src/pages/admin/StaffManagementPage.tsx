import * as React from "react";
import { Plus, Trash2, Mail, Shield, CheckCircle2 } from "lucide-react";
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

const initialStaff: StaffMember[] = [
  { id: "1", name: "Ananya Sharma", email: "ananya@velvetbrews.in", role: "manager", shift: "Morning (8 AM - 4 PM)", status: "active" },
  { id: "2", name: "Rohan Verma", email: "rohan@velvetbrews.in", role: "barista", shift: "Morning (8 AM - 4 PM)", status: "active" },
  { id: "3", name: "Vikram Singh", email: "vikram@velvetbrews.in", role: "waiter", shift: "Evening (3 PM - 11 PM)", status: "off_duty" },
  { id: "4", name: "Priya Patel", email: "priya@velvetbrews.in", role: "barista", shift: "Evening (3 PM - 11 PM)", status: "on_break" },
];

export const StaffManagementPage = () => {
  const [staffList, setStaffList] = React.useState<StaffMember[]>(initialStaff);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState<'admin' | 'manager' | 'barista' | 'waiter'>("barista");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    
    const newStaff: StaffMember = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      role: newRole,
      shift: "General (9 AM - 6 PM)",
      status: "active"
    };

    setStaffList([...staffList, newStaff]);
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    toast.success(`Added ${newStaff.name} to Staff team`);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    setStaffList(staffList.filter(s => s.id !== id));
    toast.success(`Removed ${name} from Staff`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">Staff Management</h2>
          <p className="text-sm text-[var(--color-cafe-text-secondary)]">Manage your cafe employees, roles, and shifts.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Staff Member
        </Button>
      </div>

      {/* Staff Grid */}
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

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl">
            <h3 className="font-heading text-xl font-bold mb-4">Add New Staff</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <Input 
                label="Full Name" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                required 
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                required 
              />
              <div>
                <label className="block text-sm font-medium text-[var(--color-cafe-text-secondary)] mb-1">Role</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-cafe-primary)]"
                >
                  <option value="barista">Barista</option>
                  <option value="waiter">Waiter</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Add Member</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
