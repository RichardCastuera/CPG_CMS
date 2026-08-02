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
import { AppUser, UserRole } from "@/lib/users";

interface UserActionsMenuProps {
  user: AppUser;
  onChangeRole: (id: string, role: UserRole) => void;
  onRemove: (id: string) => void;
}

export function UserActionsMenu({
  user,
  onChangeRole,
  onRemove,
}: UserActionsMenuProps) {
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="text-sm font-medium text-foreground hover:underline">
              Manage
            </button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Change role
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleRemove}
          >
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
