import React from "react";
import { User, Key, Shield, Bell, CheckCircle2, Save, Clock, Lock } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import toast from "react-hot-toast";

export const ProfilePage = () => {
  const [profile, setProfile] = React.useState(() => {
    try {
      const saved = localStorage.getItem("velvet_admin_profile");
      return saved
        ? JSON.parse(saved)
        : { name: "Admin Owner", email: "owner@velvetbrews.com", phone: "+91 98765 00000", role: "Master Administrator" };
    } catch {
      return { name: "Admin Owner", email: "owner@velvetbrews.com", phone: "+91 98765 00000", role: "Master Administrator" };
    }
  });

  const [passwords, setPasswords] = React.useState({ current: "", newPass: "", confirm: "" });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [changingPass, setChangingPass] = React.useState(false);

  const handleSaveProfile = () => {
    if (!profile.name || !profile.email) {
      toast.error("Name and Email are required");
      return;
    }
    setSavingProfile(true);
    setTimeout(() => {
      try {
        localStorage.setItem("velvet_admin_profile", JSON.stringify(profile));
        toast.success("Profile details updated successfully!");
      } catch {
        toast.error("Failed to update profile");
      } finally {
        setSavingProfile(false);
      }
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) {
      toast.error("Please enter current password");
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPass(true);
    setTimeout(() => {
      toast.success("Password changed successfully! Keep your new credentials secure.");
      setPasswords({ current: "", newPass: "", confirm: "" });
      setChangingPass(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 text-[var(--color-cafe-primary)]" />
          Owner Profile & Security
        </h2>
        <p className="text-sm text-gray-500">Manage administrator account details, security credentials, and active portal sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <Card className="p-6 bg-white shadow-xs space-y-6 border-gray-100 flex flex-col items-center text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-[var(--color-cafe-primary)] text-white font-bold text-3xl flex items-center justify-center shadow-lg ring-4 ring-amber-100">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white" title="Active Online"></span>
          </div>

          <div>
            <h3 className="font-bold text-lg text-gray-900">{profile.name}</h3>
            <p className="text-xs font-semibold text-[var(--color-cafe-primary)] bg-amber-50 px-3 py-1 rounded-full inline-block mt-1">
              {profile.role}
            </p>
            <p className="text-xs text-gray-500 mt-2">{profile.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-gray-100 space-y-2 text-left text-xs text-gray-600">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-400">Portal Security Level</span>
              <span className="font-bold text-emerald-600">Tier 1 Root Admin</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-400">2-Factor Auth</span>
              <span className="font-bold text-gray-800">Enabled (Authenticator)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Last Login</span>
              <span className="font-medium text-gray-700">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </Card>

        {/* Profile Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white shadow-xs space-y-4 border-gray-100">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="h-5 w-5 text-[var(--color-cafe-primary)]" />
              <h3 className="font-bold text-base text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Role / Title"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-[var(--color-cafe-primary)] hover:bg-[#724e2c] text-white gap-2 shadow-xs"
              >
                <Save className="h-4 w-4" /> {savingProfile ? "Saving..." : "Save Profile Details"}
              </Button>
            </div>
          </Card>

          {/* Security Credentials */}
          <Card className="p-6 bg-white shadow-xs space-y-4 border-gray-100">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Key className="h-5 w-5 text-[var(--color-cafe-primary)]" />
              <h3 className="font-bold text-base text-gray-900">Change Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={changingPass} variant="outline" className="gap-2 border-gray-300">
                  <Lock className="h-4 w-4 text-amber-700" /> {changingPass ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Active Sessions */}
          <Card className="p-6 bg-white shadow-xs space-y-3 border-gray-100">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Shield className="h-5 w-5 text-[var(--color-cafe-primary)]" />
              <h3 className="font-bold text-base text-gray-900">Active Admin Sessions</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-emerald-700 font-bold shadow-2xs">Chrome</div>
                  <div>
                    <p className="font-bold text-emerald-950">Current Window (This Device)</p>
                    <p className="text-emerald-700 text-[11px]">Surat, India • 192.168.1.100</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full font-bold text-[10px]">Active Now</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-gray-700 font-bold shadow-2xs">Safari Mobile</div>
                  <div>
                    <p className="font-bold text-gray-800">Velvet Owner iOS App</p>
                    <p className="text-gray-500 text-[11px]">Surat, India • 2 hours ago</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.success("Remote session revoked")}
                  className="text-red-600 font-bold hover:underline"
                >
                  Revoke
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

