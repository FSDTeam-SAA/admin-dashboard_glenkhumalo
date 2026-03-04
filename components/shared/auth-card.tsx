import { cn } from "@/lib/utils";

export function AuthCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("w-full max-w-[580px] rounded-3xl border border-slate-200 bg-white px-10 py-12 shadow-sm", className)}>
      {children}
    </div>
  );
}
