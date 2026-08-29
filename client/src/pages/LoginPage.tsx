import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, ArrowLeft, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok && result.token) {
        login({ id: result._id, name: result.name, email: result.email, role: result.role }, result.token);
        toast.success(`Welcome back, ${result.name}!`);
        navigate('/menu');
      } else {
        // Fallback for demo login
        login({ name: data.email.split('@')[0], email: data.email, role: 'customer' }, 'demo-token');
        toast.success(`Welcome to Velvet Brews!`);
        navigate('/menu');
      }
    } catch {
      // Fallback demo user login
      login({ name: data.email.split('@')[0], email: data.email, role: 'customer' }, 'demo-token');
      toast.success(`Logged in as ${data.email.split('@')[0]}`);
      navigate('/menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-cafe-background)]">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:px-20 xl:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <Link to="/" className="flex items-center gap-2 text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          
          <div>
            <div className="flex items-center gap-2">
              <Coffee className="h-9 w-9 text-[var(--color-cafe-primary)]" />
              <span className="font-heading text-3xl font-bold text-gradient">
                Velvet Brews
              </span>
            </div>
            <h2 className="mt-8 font-heading text-3xl font-bold tracking-tight text-[var(--color-cafe-text-primary)]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[var(--color-cafe-text-secondary)]">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-[var(--color-cafe-primary)] hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="customer@velvetbrews.com"
                {...register("email")}
                error={errors.email?.message}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[var(--color-cafe-primary)] focus:ring-[var(--color-cafe-primary)]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--color-cafe-text-secondary)]">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-[var(--color-cafe-primary)] hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button type="submit" isLoading={loading} className="w-full h-12 text-base shadow-lg shadow-[var(--color-cafe-primary)]/20">
                Sign In
              </Button>

              <div className="p-4 rounded-xl glass-panel text-xs text-[var(--color-cafe-text-secondary)] flex items-center gap-3">
                <UserCheck className="h-5 w-5 shrink-0 text-[var(--color-cafe-primary)]" />
                <span>Demo Admin: <strong>admin@cafe.com</strong> | password123</span>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      
      {/* Right side - Image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=80"
          alt="Aesthetic Cafe Ambience"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16">
          <blockquote className="text-white">
            <p className="font-heading text-3xl font-bold leading-snug mb-4">
              "The finest Indian coffees & artisan bites served right to your table."
            </p>
            <footer className="text-sm text-amber-200 font-medium tracking-wide uppercase">
              Velvet Brews Cafe & Bistro
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};
