"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react";

function StatCard({ title, value, positive = true }: { title: string; value: string; positive?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-base text-slate-500">{title}</p>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-2xl font-semibold text-[#1f2b44]">{value}</p>
        <p className={`flex items-center gap-1 text-base font-semibold ${positive ? "text-green-500" : "text-red-500"}`}>
          {positive ? "+36%" : "-14%"}
          {positive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: adminApi.getDashboardOverview,
  });


  return (
    <div>
      <div>
        <PageHeader title="Dashboard Overview" breadcrumbs={["Dashboard", "Overview"]} />

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Clients" value={`${data?.users.clients ?? 0}`} />
            <StatCard title="Total Creatives" value={`${data?.users.creatives ?? 0}`} positive={false} />
            <StatCard title="Total Orders" value={`${data?.orders.total ?? 0}`} />
            <StatCard title="Total Revenue" value={formatCurrency(data?.revenue.totalRevenue ?? 0)} />
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="h-[340px]">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <p className="text-lg text-slate-500">Track total revenue, platform commission, and payouts over time.</p>
            </CardHeader>
            <CardContent>
              <div className="grid h-[220px] grid-cols-12 items-end gap-2">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="rounded-t-md bg-gradient-to-t from-[#0f2f6a] to-[#9ab7ea]" style={{ height: `${50 + ((index * 9) % 120)}px` }} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="h-[340px]">
            <CardHeader>
              <CardTitle>Orders Distribution</CardTitle>
              <p className="text-lg text-slate-500">See which orders are booked the most by users.</p>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="relative h-52 w-52 rounded-full border-[36px] border-[#3ac95b] after:absolute after:inset-[-36px] after:rounded-full after:border-[36px] after:border-transparent after:border-r-[#173a82]" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
