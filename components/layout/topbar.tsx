"use client";

import { Search, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
  onMenuClick?: () => void;
};

export function Topbar({
  search,
  setSearch,
  placeholder = "Search by Category Name",
  onMenuClick,
}: Props) {
  const { data: session } = useSession();

  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-4 lg:px-6 lg:py-5">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button type="button" variant="outline" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-xl">
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 pr-14 text-base"
        />
        <button
          type="button"
          className="absolute right-0 top-0 h-11 w-14 rounded-r-md bg-gradient-to-b from-[#3d5f9f] to-[#1b366f] text-white"
        >
          <Search className="mx-auto h-5 w-5" />
        </button>
      </div>

      {/* Profile */}
      <div className="ml-auto flex items-center gap-3 whitespace-nowrap">
        <p className="hidden text-base font-medium text-slate-800 sm:block">
          {session?.user?.name || "Admin"}
        </p>
        <Avatar name={session?.user?.name ?? "Admin"} />
      </div>
    </header>
  );
}