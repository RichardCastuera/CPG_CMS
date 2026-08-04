"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";
import {
  UserPlus,
  Trash2,
  RefreshCw,
  Users2,
  ShieldCheck,
  CircleCheck,
  X,
  MailPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/Guidelines/DataTable";
import { getUserColumns } from "@/components/Users/Columns";
import { UsersTableSkeleton } from "@/components/Users/UsersTableSkeleton";
import { AppUser, UserRole } from "@/lib/users";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import StatsCard from "@/components/Cards";
import { LoadingBar } from "@/components/ui/loading-bar";

async function fetchUsers(): Promise<AppUser[]> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <LoadingBar className="h-9 w-9 rounded-lg" />
      <div className="space-y-2">
        <LoadingBar className="h-6 w-10" />
        <LoadingBar className="h-3 w-20" />
      </div>
    </div>
  );
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("author");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [justSentId, setJustSentId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkRoleOpen, setBulkRoleOpen] = useState(false);
  const [bulkRole, setBulkRole] = useState<UserRole>("author");
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [bulkRemovePending, setBulkRemovePending] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: fetchUsers,
  });

  const selectedIds = Object.keys(rowSelection);

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; role: UserRole }) =>
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setInviteOpen(false);
      setEmail("");
      setRole("author");
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["users-list"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["users-list"] }),
  });

  const resendInviteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/users/${id}/resend-invite`, { method: "POST" }).then(
        async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.error ?? "Failed to resend invite");
          }
          return res.json();
        },
      ),
  });

  function handleResendInvite(id: string) {
    setResendingId(id);
    resendInviteMutation.mutate(id, {
      onSuccess: () => {
        setResendingId(null);
        setJustSentId(id);
        setTimeout(() => setJustSentId(null), 3000);
      },
      onError: (err: any) => {
        setResendingId(null);
        alert(err?.message ?? "Failed to resend invite");
      },
    });
  }

  async function handleBulkRemove() {
    setBulkRemovePending(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/users/${id}`, { method: "DELETE" }),
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setRowSelection({});
      setBulkRemoveOpen(false);
    } finally {
      setBulkRemovePending(false);
    }
  }

  async function handleBulkResendInvite() {
    const invitedSelected = (users ?? []).filter(
      (u) => selectedIds.includes(u.id) && u.status === "invited",
    );
    if (invitedSelected.length === 0) {
      alert("None of the selected users have a pending invite.");
      return;
    }
    await Promise.all(
      invitedSelected.map((u) =>
        fetch(`/api/users/${u.id}/resend-invite`, { method: "POST" }),
      ),
    );
    alert(`Resent invite to ${invitedSelected.length} user(s).`);
    setRowSelection({});
  }

  async function handleBulkRoleChange() {
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`/api/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: bulkRole }),
        }),
      ),
    );
    queryClient.invalidateQueries({ queryKey: ["users-list"] });
    setBulkRoleOpen(false);
    setRowSelection({});
  }

  const columns = getUserColumns({
    onChangeRole: (id, role) => roleMutation.mutate({ id, role }),
    onRemove: (id) => removeMutation.mutate(id),
    onResendInvite: handleResendInvite,
    resendingId,
    justSentId,
  });

  const totalUsers = users?.length ?? 0;
  const adminCount = users?.filter((u) => u.role === "admin").length ?? 0;
  const pendingCount = users?.filter((u) => u.status === "invited").length ?? 0;
  const activeCount = users?.filter((u) => u.status === "active").length ?? 0;

  const bulkActionsBar = (
    <div className="flex items-center gap-2 rounded-md border border-[#2F6B4F]/30 bg-[#2F6B4F]/5 px-3 py-1.5">
      <span className="text-sm font-medium text-[#2F6B4F]">
        {selectedIds.length} selected
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2"
        onClick={() => setRowSelection({})}
      >
        <X size={13} />
        Clear
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2"
        onClick={() => setBulkRoleOpen(true)}
      >
        Change role
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 px-2"
        onClick={handleBulkResendInvite}
      >
        <RefreshCw size={13} />
        Resend invites
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="h-7 gap-1 px-2"
        onClick={() => setBulkRemoveOpen(true)}
      >
        <Trash2 size={13} />
        Remove
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to this workspace and what they can do.
          </p>
        </div>
        <Button
          className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus size={16} />
          Invite user
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard icon={Users2} label="Total users" value={totalUsers} />
            <StatsCard icon={ShieldCheck} label="Admins" value={adminCount} />
            <StatsCard
              icon={MailPlus}
              label="Pending invites"
              value={pendingCount}
            />
            <StatsCard icon={CircleCheck} label="Active" value={activeCount} />
          </>
        )}
      </div>

      <Card className="px-6 py-4">
        {isLoading ? (
          <UsersTableSkeleton rows={5} />
        ) : (
          <DataTable
            columns={columns}
            data={users ?? []}
            searchColumn="name"
            searchPlaceholder="Search users..."
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            bulkActionsBar={bulkActionsBar}
          />
        )}
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
            <DialogDescription>
              Send an invitation to join this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cpg.org"
                type="email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!email.trim() || inviteMutation.isPending}
              onClick={() =>
                inviteMutation.mutate({ email: email.trim(), role })
              }
              className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
            >
              {inviteMutation.isPending ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkRoleOpen} onOpenChange={setBulkRoleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Change role for {selectedIds.length} user(s)
            </DialogTitle>
          </DialogHeader>
          <Select
            value={bulkRole}
            onValueChange={(v) => setBulkRole(v as UserRole)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="reviewer">Reviewer</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkRoleChange}
              className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={bulkRemoveOpen}
        onOpenChange={setBulkRemoveOpen}
        title="Remove users"
        description={`Remove ${selectedIds.length} user(s)? This cannot be undone.`}
        confirmLabel="Remove"
        destructive
        isConfirming={bulkRemovePending}
        onConfirm={handleBulkRemove}
      />
    </div>
  );
}
