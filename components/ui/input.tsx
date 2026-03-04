import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#173a82] focus:ring-2 focus:ring-[#173a82]/20",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
