"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

const schema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  });
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (newPassword: string) => authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success("Password reset successful");
      router.push("/login");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <AuthCard>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-2 text-base font-semibold text-[#21365f]">S</div>
        <h1 className="text-base font-semibold text-[#1f2b44]">Reset Password</h1>
        <p className="mt-3 text-base text-slate-500">Create a new password</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values.password))}>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create New Password"
            className="h-14 pl-12 pr-12 text-base"
            {...register("password")}
          />
          <button type="button" className="absolute right-3 top-3 text-slate-500" onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </button>
          {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password.message}</p> : null}
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            className="h-14 pl-12 text-base"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p> : null}
        </div>

        <Button className="h-14 w-full text-base" disabled={!token || mutation.isPending}>
          {mutation.isPending ? "Submitting..." : "Send OTP"}
        </Button>
      </form>
    </AuthCard>
  );
}
