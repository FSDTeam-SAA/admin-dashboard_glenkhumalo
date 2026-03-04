"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";

export default function VerificationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["verification-detail", params.id],
    queryFn: () => adminApi.getVerificationDetail(params.id),
  });

  const mutation = useMutation({
    mutationFn: (action: "approve" | "reject") =>
      adminApi.reviewVerification(params.id, {
        action,
        rejectionReason: action === "reject" ? "Rejected by admin" : undefined,
      }),
    onSuccess: (_, action) => {
      toast.success(
        action === "approve"
          ? "Verification approved"
          : "Verification rejected",
      );
      refetch();
      router.push("/verification");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div>
      <Topbar search="" setSearch={(value) => void value} />
      <div>
        <Card>
          <CardContent>
            <PageHeader
              title="User Details"
              breadcrumbs={["Dashboard", "Subscription management"]}
            />

            {isLoading ? (
              <Skeleton className="h-[650px] w-full" />
            ) : data ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 p-4 lg:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={data.creative?.profileImage?.url}
                        name={data.creative?.name}
                        className="h-20 w-20"
                      />
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {data.creative?.name}
                        </h2>
                        <p className="text-base text-slate-600">
                          {data.creative?.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-base">
                      <p>
                        Payment{" "}
                        <span className="ml-2 text-2xl font-semibold">
                          {formatCurrency(data.paymentAmount)}
                        </span>
                      </p>
                      <p className="mt-2">
                        Service{" "}
                        <span className="ml-2 text-2xl font-semibold">
                          Dancer
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <section>
                  <h3 className="mb-3 text-xl font-semibold">Portfolio</h3>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div
                        key={index}
                        className="relative h-40 overflow-hidden rounded-xl bg-slate-200"
                      >
                        <Image
                          src="https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&q=80"
                          alt="portfolio"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-xl font-semibold">Reels</h3>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div
                        key={index}
                        className="relative h-52 overflow-hidden rounded-xl bg-slate-200"
                      >
                        <Image
                          src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80"
                          alt="reels"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="destructive"
                    className="h-11 text-base"
                    onClick={() => mutation.mutate("reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    className="h-11 text-base"
                    onClick={() => mutation.mutate("approve")}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-lg text-slate-500">
                Verification request not found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
