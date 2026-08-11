// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  useCurrentUser,
  useInvalidateCurrentUser,
} from "@/lib/hooks/useCurrentUser";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  author: "Author",
  reviewer: "Reviewer",
};

type PasswordStatus = "idle" | "saving" | "saved" | "error";

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();
  const invalidateCurrentUser = useInvalidateCurrentUser();

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus>("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  async function handleSaveName() {
    setSavingName(true);
    setNameSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to save");
      invalidateCurrentUser();
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      setPasswordStatus("error");
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setPasswordStatus("saving");
    setPasswordError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordStatus("error");
      setPasswordError(error.message);
      return;
    }

    setPasswordStatus("saved");
    setNewPassword("");
    setTimeout(() => setPasswordStatus("idle"), 2000);
  }

  if (loading) {
    return (
      <p className="p-6 text-sm text-muted-foreground">Loading profile...</p>
    );
  }

  if (!user) {
    return <p className="p-6 text-sm text-muted-foreground">Not signed in.</p>;
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Your login email and role can&apos;t be changed here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                value={user.email}
                disabled
                className="disabled:text-foreground disabled:opacity-100 disabled:bg-muted"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <Input
                value={ROLE_LABELS[user.role]}
                disabled
                className="disabled:text-foreground disabled:opacity-100 disabled:bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display name</CardTitle>
            <CardDescription>
              This is shown on comments and audit log entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveName}
                disabled={savingName || !name.trim()}
                className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
              >
                {savingName ? "Saving..." : "Save"}
              </Button>
              {nameSaved && (
                <span className="text-sm text-emerald-700">Saved</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Choose a new password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleChangePassword}
                disabled={passwordStatus === "saving" || !newPassword}
                className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
              >
                {passwordStatus === "saving"
                  ? "Updating..."
                  : "Update password"}
              </Button>
              {passwordStatus === "saved" && (
                <span className="text-sm text-emerald-700">Updated</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
