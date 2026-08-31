import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = (location.state as any)?.email || "";
  const targetFrom = (location.state as any)?.from?.pathname || '/menu';

  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: prefilledEmail,
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });
      const result = await response.json();

      if (response.ok && result.token) {
        login({ id: result._id, name: result.name, email: result.email, role: result.role || 'customer' }, result.token);
        toast.success(`Account created successfully! Welcome, ${result.name}`);
        navigate(targetFrom);
      } else {
        toast.error(result.message || 'Registration failed. Please check your details.');
      }
    } catch {
      toast.error('Unable to reach backend server. Please make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-cafe-background)]">
      {/* Left side - Image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80"
          alt="Latte art"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <blockquote className="text-white">
            <p className="font-heading text-3xl font-bold leading-snug mb-4">
              "Join the Velvet Brews community. Freshly roasted coffees and delicious bites await you."
            </p>
          </blockquote>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:px-20 xl:px-24">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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
              Create an account
            </h2>
            <p className="mt-2 text-sm text-[var(--color-cafe-text-secondary)]">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-[var(--color-cafe-primary)] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                placeholder="Rahul Sharma"
                {...register("name")}
                error={errors.name?.message}
              />
              
              <Input
                label="Email address"
                type="email"
                placeholder="rahul@example.com"
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

              <Button type="submit" isLoading={loading} className="w-full h-12 text-base shadow-lg shadow-[var(--color-cafe-primary)]/20">
                Create Account
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
