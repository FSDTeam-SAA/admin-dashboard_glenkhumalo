export const APP_CONFIG = {
  appName: "Solace Admin",
  baseUrl:
    process.env.NEXTPUBLICBASEURL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASEURL ||
    "http://localhost:5000/api/v1",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard Overview", key: "dashboard" },
  { href: "/users", label: "Users Management", key: "users" },
  { href: "/clients", label: "Client Management", key: "clients" },
  { href: "/creatives", label: "Creative Management", key: "creatives" },
  { href: "/revenue", label: "Revenue", key: "revenue" },
  { href: "/payments", label: "Payment History", key: "payments" },
  { href: "/subscriptions", label: "Subscription Management", key: "subscriptions" },
  { href: "/verification", label: "Verification", key: "verification" },
  { href: "/website", label: "Manage website", key: "website" },
  { href: "/support", label: "Support", key: "support" },
  { href: "/settings", label: "Settings", key: "settings" },
] as const;
