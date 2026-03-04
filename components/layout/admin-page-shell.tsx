"use client";

import { ReactNode, useState } from "react";
import { Topbar } from "@/components/layout/topbar";

type Props = {
  children: ReactNode;
  placeholder?: string;
};

export function AdminPageShell({ children, placeholder }: Props) {
  const [search, setSearch] = useState("");

  return (
    <div>
      <Topbar search={search} setSearch={setSearch} placeholder={placeholder} />
      <div>{typeof children === "function" ? null : children}</div>
    </div>
  );
}
