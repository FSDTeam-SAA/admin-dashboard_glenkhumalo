"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SupportPage() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div>
        <Card>
          <CardContent className="p-6">
            <PageHeader
              title="Support"
              breadcrumbs={["Dashboard", "Support"]}
            />
            <p className="text-base text-slate-600">
              Support center is ready for ticket integration. Connect it to
              `/support` APIs when available.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
