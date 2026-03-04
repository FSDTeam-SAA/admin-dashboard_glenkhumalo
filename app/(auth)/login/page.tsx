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
      accessToken = session?.accessToken || null;
      refreshToken = session?.refreshToken || null;
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
        <div className="mb-2 flex items-center justify-center gap-3">
          <Image src="/icon-logo.png" alt="Solace logo" width={52} height={52} className="h-12 w-12" />
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <Input placeholder="Enter your email" className="h-14 pl-12 text-base" {...register("email")} />
          {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your Password"
            className="h-14 pl-12 pr-12 text-base"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-3 text-slate-500"
          >
            {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </button>
          {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password.message}</p> : null}
        </div>

        <div className="flex items-center justify-between text-lg">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="h-4 w-4" /> Remember me
          </label>
          <button type="button" onClick={() => router.push("/forgot-password")} className="text-red-500">
            Forgot password?
          </button>
        </div>

        <Button disabled={isSubmitting} className="h-14 w-full text-xl font-semibold">
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}
