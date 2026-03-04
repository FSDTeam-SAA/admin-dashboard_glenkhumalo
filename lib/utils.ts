import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value)
}

export function getInitials(name?: string) {
  if (!name) return "?"
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return "?"

  // First + Last initials (e.g., "John Doe" -> "JD")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Single word (e.g., "John" -> "J")
  return parts[0][0].toUpperCase()
}

export function formatDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error
  if (error && typeof error === "object") {
    const maybeError = error as { response?: { data?: { message?: string } }; message?: string }
    return maybeError.response?.data?.message || maybeError.message || "Something went wrong"
  }
  return "Something went wrong"
}
