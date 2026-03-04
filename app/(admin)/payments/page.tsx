"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatCurrency, getErrorMessage } from "@/lib/utils";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["payments", { page, limit }],
    queryFn: () => adminApi.getPayments({ page, limit }),
  });

  const approveMutation = useMutation({
    mutationFn: (transactionId: string) =>
      adminApi.approvePayment(transactionId),
    onSuccess: () => {
      toast.success("Payment approved");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const filteredRows = (data?.payments || []).filter((item) => {
    const query = search.toLowerCase();
    return (
      item.client?.name?.toLowerCase().includes(query) ||
      item.creative?.name?.toLowerCase().includes(query) ||
      item.order?.orderId?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div>
        <Card>
          <CardContent>
            <PageHeader
              title="Payment History"
              breadcrumbs={["Dashboard", "Payment History"]}
            />

            {isLoading ? (
              <TableSkeleton cols={8} />
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Creative Name</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell>{row.client?.name || "-"}</TableCell>
                          <TableCell>{row.creative?.name || "-"}</TableCell>
                          <TableCell>{row.order?.orderId || "-"}</TableCell>
                          <TableCell>{formatCurrency(row.amount)}</TableCell>
                          <TableCell>{row.order?.title || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                row.adminApproved
                                  ? "bg-green-500 text-white"
                                  : "bg-amber-400 text-white"
                              }
                            >
                              {row.adminApproved ? "Completed" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!row.adminApproved ? (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    approveMutation.mutate(row._id)
                                  }
                                >
                                  Approve
                                </Button>
                              ) : null}
                              <Link
                                href={`/payments/${row._id}`}
                                className="rounded-md p-1 text-[#173a82] hover:bg-slate-100"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <PaginationBar
                  page={page}
                  totalPages={data?.pagination.totalPages ?? 1}
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
