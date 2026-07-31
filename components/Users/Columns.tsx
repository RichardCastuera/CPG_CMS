"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { AppUser, UserRole } from "@/lib/users";
import { formatRelativeShort } from "@/lib/formatRelativeShort";
import { UserActionsMenu } from "./UserActionsMenu";

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  admin: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  author: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  reviewer: "bg-blue-100 text-blue-800 hover:bg-blue-100",
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  author: "Author",
  reviewer: "Reviewer",
};

export function getUserColumns(handlers: {
  onChangeRole: (id: string, role: UserRole) => void;
  onRemove: (id: string) => void;
}): ColumnDef<AppUser>[] {
  return [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge className={ROLE_BADGE_STYLES[row.original.role]}>
          {ROLE_LABELS[row.original.role]}
        </Badge>
      ),
    },
    {
      accessorKey: "lastActiveAt",
      header: "Last active",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatRelativeShort(row.original.lastActiveAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <UserActionsMenu
            user={row.original}
            onChangeRole={handlers.onChangeRole}
            onRemove={handlers.onRemove}
          />
        </div>
      ),
    },
  ];
}
