"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, type UserRow } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["clients", { page, limit, search }],
    queryFn: () => adminApi.getUsers({ page, limit, search, role: "client" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "approved" | "suspended" | "rejected";
    }) => adminApi.toggleUserStatus(userId, status),
    onSuccess: () => {
      toast.success("Client status updated");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div>
      <div>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <PageHeader
              title="Client Management"
              breadcrumbs={["Dashboard", "Client Management"]}
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
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Total Order</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={user.profileImage?.url}
                                name={user.name}
                              />
                              <span>{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || "-"}</TableCell>
                          <TableCell>0</TableCell>
                          <TableCell>
                            <button
                              className="rounded-full border border-green-500 px-3 py-1 text-green-600"
                              onClick={() => setSelected(user)}
                            >
                              Details
                            </button>
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

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              Moderation and account information
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-5">
              <div className="mx-auto w-fit">
                <Avatar
                  src={selected.profileImage?.url}
                  name={selected.name}
                  className="h-16 w-16"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-lg">
                <p>Name</p>
                <p className="font-semibold">{selected.name}</p>
                <p>Email</p>
                <p className="font-semibold">{selected.email}</p>
                <p>Phone Number</p>
                <p className="font-semibold">{selected.phone || "-"}</p>
                <p>Location</p>
                <p className="font-semibold">{selected.address || "-"}</p>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() =>
                  statusMutation.mutate({
                    userId: selected._id,
                    status:
                      selected.accountStatus === "suspended"
                        ? "approved"
                        : "suspended",
                  })
                }
              >
                {selected.accountStatus === "suspended"
                  ? "Unblock account"
                  : "Block account"}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
