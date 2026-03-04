"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Mail, Eye, EyeOff, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setApiAccessToken, setApiRefreshToken } from "@/lib/api";
import Image from "next/image";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error || !result.ok) {
      toast.error("Invalid admin credentials");
      return;
    }

    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const session = await getSession();
      accessToken = (session as any)?.accessToken || null;
      refreshToken = (session as any)?.refreshToken || null;
      if (accessToken) break;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    if (!accessToken) {
      toast.error("Login failed to create session. Please try again.");
      return;
    }

    setApiAccessToken(accessToken);
    setApiRefreshToken(refreshToken);

    toast.success("Login successful");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthCard>
      <div className="mb-8 text-center">
        <div className="mb-4 flex flex-col items-center justify-center gap-3">
          <Image 
            src="/icon-logo.png" 
            alt="Solace logo" 
            width={60} 
            height={60} 
            className="mb-2"
          />
          <h1 className="text-3xl font-bold text-[#1E293B]">Solace Admin</h1>
          <p className="text-slate-500 text-sm">Secure access for moderation & support</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Enter your email" 
            className="h-14 pl-12 border-slate-300 rounded-lg text-base focus-visible:ring-1 focus-visible:ring-slate-400" 
            {...register("email")} 
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your Password"
            className="h-14 pl-12 pr-12 border-slate-300 rounded-lg text-base focus-visible:ring-1 focus-visible:ring-slate-400"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* Remember & Forgot Password */}
        <div className="flex items-center justify-end text-sm">
          <button 
            type="button" 
            onClick={() => router.push("/forgot-password")} 
            className="text-[#F43F5E] hover:underline font-medium"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button 
          disabled={isSubmitting} 
          className="h-14 w-full text-lg font-semibold bg-[#0F2A66] hover:bg-[#162f6e] text-white rounded-lg transition-colors"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}