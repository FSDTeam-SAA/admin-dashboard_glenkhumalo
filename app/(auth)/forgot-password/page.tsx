"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
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

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (_, email) => {
      toast.success("OTP sent successfully");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <AuthCard>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-2 text-base font-semibold text-[#21365f]">S</div>
        <h1 className="text-base font-semibold text-[#1f2b44]">Forgot Password</h1>
        <p className="mt-3 text-base text-slate-500">Enter your email to recover your password</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit((values) => mutation.mutate(values.email))}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <Input placeholder="Enter your email" className="h-14 pl-12 text-base" {...register("email")} />
          {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
        </div>

        <Button className="h-14 w-full text-base">{mutation.isPending ? "Sending..." : "Send OTP"}</Button>
      </form>
    </AuthCard>
  );
}
