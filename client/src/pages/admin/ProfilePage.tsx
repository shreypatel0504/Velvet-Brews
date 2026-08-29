import * as React from "react";
import { Shield, Save } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export const ProfilePage = () => {
  const { user, login, token } = useAuthStore();
  const [name, setName] = React.useState(user?.name || "Admin Owner");
  const [email, setEmail] = React.useState(user?.email || "admin@velvetbrews.in");
  const [password, setPassword] = React.useState("");

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    login({ ...user, name, email }, token || "token");
    toast.success("Profile details updated!");
    setPassword("");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">Admin Profile</h2>
        <p className="text-sm text-[var(--color-cafe-text-secondary)]">Manage your personal account credentials and profile preferences.</p>
      </div>

      <Card className="p-8 border-transparent glass-panel">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
          <div className="h-16 w-16 rounded-full bg-[var(--color-cafe-primary)] text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-[var(--color-cafe-primary)]/20">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-xl text-[var(--color-cafe-text-primary)]">{name}</h3>
            <p className="text-sm text-[var(--color-cafe-text-secondary)] flex items-center gap-1.5 mt-0.5">
              <Shield className="h-4 w-4 text-[var(--color-cafe-primary)]" />
              Owner & Administrator
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <Input 
            label="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input 
            label="Email Address" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input 
            label="Change Password" 
            type="password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="gap-2 px-8 h-12">
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
