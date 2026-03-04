import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

type Props = {
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
};

export function Avatar({ src, alt, name, className }: Props) {
  if (src) {
    return (
      <div className={cn("relative h-10 w-10 overflow-hidden rounded-full bg-slate-200", className)}>
        <Image src={src} alt={alt || name || "avatar"} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-[#173a82] text-sm font-semibold text-white",
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
