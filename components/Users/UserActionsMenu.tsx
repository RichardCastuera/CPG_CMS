"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCog, Mail, UserX } from "lucide-react";
import { AppUser, UserRole } from "@/lib/users";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface UserActionsMenuProps {
  user: AppUser;
  onChangeRole: (id: string, role: UserRole) => void;
  onRemove: (id: string) => void;
  onResendInvite?: (id: string) => void;
}

export function UserActionsMenu({
  user,
  onChangeRole,
  onRemove,
  onResendInvite,
}: UserActionsMenuProps) {
  const { user: me } = useCurrentUser();
  const isAdmin = me?.role === "admin";
  const isSelf = me?.id === user.id;

  const [editOpen, setEditOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(user.role);

  function handleSave() {
    if (role !== user.role) onChangeRole(user.id, role);
    setEditOpen(false);
  }

  function handleRemove() {
    if (
      confirm(
        `Remove ${user.name} (${user.email})? They will lose access immediately.`,
      )
    ) {
      onRemove(user.id);
    }
  }

  if (!isAdmin) {
    // Non-admins can't act on any user, including themselves — nothing to show.
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal size={16} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={isSelf} onClick={() => setEditOpen(true)}>
            <UserCog size={14} className="mr-2" />
            Change role
          </DropdownMenuItem>
          {user.status === "invited" && onResendInvite && (
            <DropdownMenuItem onClick={() => onResendInvite(user.id)}>
              <Mail size={14} className="mr-2" />
              Resend invite
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={isSelf}
            className="text-destructive focus:text-destructive"
            onClick={handleRemove}
          >
            <UserX size={14} className="mr-2" />
            Remove user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change role for {user.name}</DialogTitle>
          </DialogHeader>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
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
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
