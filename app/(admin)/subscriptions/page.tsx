"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Trash2 } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type PlanForm = {
  name: string;
  price: string;
  billingCycle: string;
  title: string;
  includes: string;
};

const defaultPlan: PlanForm = {
  name: "Job Post",
  price: "12.00",
  billingCycle: "Yearly",
  title: "The complete solution for serious business grant seekers.",
  includes: "Create one job post and find your creative",
};

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isViewOpen, setViewOpen] = useState(false);
  const [plan, setPlan] = useState(defaultPlan);

  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions-list", { page, limit }],
    queryFn: () => adminApi.getUsers({ page, limit, role: "creative", search }),
  });

  const rows = useMemo(() => data?.users || [], [data?.users]);

  return (
    <div>
      <div>
        <Card>
          <CardContent>
            <PageHeader
              title="Creative Management"
              breadcrumbs={["Dashboard", "Subscription management"]}
              actions={
                <>
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    Edit Plan
                  </Button>
                  <Button variant="outline" onClick={() => setCreateOpen(true)}>
                    Create Plan
                  </Button>
                </>
              }
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
                        <TableHead>Email</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Job Post</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, index) => (
                        <TableRow key={row._id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{formatCurrency(34456)}</TableCell>
                          <TableCell>{(index + row._id.length) % 6}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <button className="text-red-500">
                                <Trash2 className="h-5 w-5" />
                              </button>
                              <button
                                className="text-[#173a82]"
                                onClick={() => setViewOpen(true)}
                              >
                                <Eye className="h-5 w-5" />
                              </button>
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

      <Dialog open={isViewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-lg">
            <div>
              <p className="font-semibold">Plan Name</p>
              <p className="text-slate-600">{plan.name}</p>
            </div>
            <div>
              <p className="font-semibold">Price</p>
              <p className="text-slate-600">${plan.price}</p>
            </div>
            <div>
              <p className="font-semibold">Billing Cycle</p>
              <p className="text-slate-600">{plan.billingCycle}</p>
            </div>
            <div>
              <p className="font-semibold">Title</p>
              <p className="text-slate-600">{plan.title}</p>
            </div>
            <div>
              <p className="font-semibold">This Package Include</p>
              <p className="text-slate-600">{plan.includes}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Plan</DialogTitle>
          </DialogHeader>
          <PlanFormView
            plan={plan}
            setPlan={setPlan}
            onCancel={() => setCreateOpen(false)}
            onSave={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
          </DialogHeader>
          <PlanFormView
            plan={plan}
            setPlan={setPlan}
            onCancel={() => setEditOpen(false)}
            onSave={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanFormView({
  plan,
  setPlan,
  onCancel,
  onSave,
}: {
  plan: PlanForm;
  setPlan: (value: PlanForm) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-lg font-semibold">Plan Name</p>
          <Input
            value={plan.name}
            onChange={(e) => setPlan({ ...plan, name: e.target.value })}
            className="h-12"
          />
        </div>
        <div>
          <p className="mb-1 text-lg font-semibold">Price</p>
          <Input
            value={plan.price}
            onChange={(e) => setPlan({ ...plan, price: e.target.value })}
            className="h-12"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-lg font-semibold">Billing Cycle</p>
          <Input
            value={plan.billingCycle}
            onChange={(e) => setPlan({ ...plan, billingCycle: e.target.value })}
            className="h-12"
          />
        </div>
        <div>
          <p className="mb-1 text-lg font-semibold">Title</p>
          <Input
            value={plan.title}
            onChange={(e) => setPlan({ ...plan, title: e.target.value })}
            className="h-12"
          />
        </div>
      </div>
      <div>
        <p className="mb-1 text-lg font-semibold">This Package Include</p>
        <Textarea
          value={plan.includes}
          onChange={(e) => setPlan({ ...plan, includes: e.target.value })}
          className="min-h-24"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
}
