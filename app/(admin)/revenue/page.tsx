"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function RevenuePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["revenue", { search }],
    queryFn: () => adminApi.getRevenue({ search }),
  });

  const rows = data?.transactions || [];
  const start = (page - 1) * limit;
  const paginatedRows = rows.slice(start, start + limit);
  const totalPages = Math.ceil(rows.length / limit) || 1;

  const stats = useMemo(
    () => [
      {
        title: "Client's Payment",
        value: formatCurrency(data?.summary.totalAmount || 0),
        positive: true,
      },
      {
        title: "Creative's Payment",
        value: formatCurrency(data?.summary.totalCreativeAmount || 0),
        positive: false,
      },
      {
        title: "Total Payment",
        value: formatCurrency(data?.summary.totalAmount || 0),
        positive: true,
      },
      {
        title: "Total Revenue",
        value: formatCurrency(data?.summary.totalPlatformFee || 0),
        positive: true,
      },
    ],
    [data],
  );

  return (
    <div>
      <div>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.title}>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">{item.title}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p
                    className={`text-sm font-semibold ${item.positive ? "text-green-500" : "text-red-500"}`}
                  >
                    {item.positive ? "+36%" : "-14%"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent>
            <PageHeader
              title="Revenue List"
              breadcrumbs={["Dashboard", "Revenue List"]}
            />

            {isLoading ? (
              <TableSkeleton cols={5} />
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Creative Name</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Services</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRows.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar name={row.client?.name} />
                              <span>{row.client?.name || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar name={row.creative?.name} />
                              <span>{row.creative?.name || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{row.order?.orderId || "-"}</TableCell>
                          <TableCell>
                            {formatCurrency(row.platformFee)}
                          </TableCell>
                          <TableCell>{row.order?.title || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                    setPage(1);
                    setLimit(newLimit);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
