"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("email") || "";
  });
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const token = useMemo(() => code.join(""), [code]);

  return (
    <AuthCard>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-2 text-base font-semibold text-[#21365f]">S</div>
        <h1 className="text-base font-semibold text-[#1f2b44]">Verify Email</h1>
        <p className="mt-3 text-base text-slate-500">Enter your email to recover your password</p>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {code.map((value, index) => (
          <input
            key={index}
            value={value}
            maxLength={1}
            onChange={(event) => {
              const next = [...code];
              next[index] = event.target.value.replace(/\D/g, "");
              setCode(next);
            }}
            className="h-12 rounded-xl border border-slate-300 text-center text-base outline-none focus:border-[#173a82]"
          />
        ))}
      </div>

      <Button
        className="mt-8 h-14 w-full text-base"
        disabled={token.length < 6}
        onClick={() => {
          toast.success("OTP verified");
          router.push(`/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
        }}
      >
        Send OTP
      </Button>
    </AuthCard>
  );
}
