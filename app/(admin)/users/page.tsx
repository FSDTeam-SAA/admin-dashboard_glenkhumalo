"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { formatDate, getErrorMessage } from "@/lib/utils";

function statusClass(status: string) {
  if (status === "approved") return "bg-green-100 text-green-600";
  if (status === "suspended") return "bg-red-100 text-red-600";
  if (status === "rejected") return "bg-amber-100 text-amber-600";
  return "bg-slate-100 text-slate-600";
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: () => adminApi.getUsers({ page, limit, search }),
  });

  const stats = useMemo(() => {
    const rows = data?.users || [];
    return {
      total: rows.length,
      active: rows.filter((row) => row.accountStatus === "approved").length,
      inactive: rows.filter((row) => row.accountStatus !== "approved").length,
    };
  }, [data?.users]);

  const statusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "approved" | "suspended" | "rejected";
    }) => adminApi.toggleUserStatus(userId, status),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div>
      <div>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2 text-base text-slate-500">
              Total Visitors
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.total}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 text-base text-slate-500">
              Total Users
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.active}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 text-base text-slate-500">
              App Download
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.inactive}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <PageHeader
              title="User Management"
              breadcrumbs={["Dashboard", "User Management"]}
            />

            {isLoading ? (
              <TableSkeleton cols={8} rows={10} />
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined On</TableHead>
                        <TableHead>App Download</TableHead>
                        <TableHead>Status</TableHead>
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
                              <span>{user.name || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.address || "-"}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-amber-500">
                            {user.phone ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusClass(user.accountStatus)}>
                              {user.accountStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-md p-1 text-red-500 hover:bg-red-50"
                                onClick={() =>
                                  statusMutation.mutate({
                                    userId: user._id,
                                    status:
                                      user.accountStatus === "suspended"
                                        ? "approved"
                                        : "suspended",
                                  })
                                }
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                              <button
                                className="rounded-md p-1 text-[#173a82] hover:bg-slate-100"
                                onClick={() => setSelectedUser(user)}
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

      <Dialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Account summary and moderation controls
            </DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-4 text-lg">
              <div className="mx-auto w-fit">
                <Avatar
                  src={selectedUser.profileImage?.url}
                  name={selectedUser.name}
                  className="h-16 w-16"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p>Name</p>
                <p className="font-semibold">{selectedUser.name}</p>
                <p>Email</p>
                <p className="font-semibold">{selectedUser.email}</p>
                <p>Phone</p>
                <p className="font-semibold">{selectedUser.phone || "-"}</p>
                <p>Status</p>
                <p className="font-semibold capitalize">
                  {selectedUser.accountStatus}
                </p>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() =>
                  statusMutation.mutate({
                    userId: selectedUser._id,
                    status:
                      selectedUser.accountStatus === "suspended"
                        ? "approved"
                        : "suspended",
                  })
                }
              >
                {selectedUser.accountStatus === "suspended"
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
