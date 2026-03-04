"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["payment-detail", params.id],
    queryFn: () => adminApi.getPaymentDetail(params.id),
  });

  return (
    <div>
      <Topbar search="" setSearch={(value) => void value} />
      <div>
        <Card>
          <CardContent className="p-6">
            <PageHeader
              title="Payment Details"
              breadcrumbs={["Dashboard", "Payment History", "Details"]}
            />

            {isLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : data ? (
              <div className="space-y-8 rounded-xl border border-slate-200 p-6">
                <h2 className="text-2xl font-semibold">
                  Order ID: {data.order?.orderId}
                </h2>
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-2 text-base">
                    <p className="text-slate-500">Client</p>
                    <p className="text-2xl font-semibold">
                      {data.client?.name}
                    </p>
                    <p>{data.client?.email}</p>
                  </div>
                  <div className="space-y-2 text-base">
                    <p className="text-slate-500">Creative</p>
                    <p className="text-2xl font-semibold">
                      {data.creative?.name}
                    </p>
                    <p>{data.creative?.email}</p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-slate-500">Amount</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(data.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Platform Fee</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(data.platformFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Creative Amount</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(data.creativeAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Transaction ID</p>
                    <p className="text-base font-semibold">
                      {data.transactionId}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Created</p>
                    <p className="text-base font-semibold">
                      {formatDate(data.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className="text-base font-semibold capitalize">
                      {data.adminApproved ? "completed" : "pending"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button onClick={() => router.push("/payments")}>
                    Confirm
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-lg text-slate-500">No payment found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
