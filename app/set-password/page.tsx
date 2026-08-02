"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/guidelines");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6"
      >
        <div>
          <h1 className="text-xl font-bold">Set your password</h1>
          <p className="text-sm text-muted-foreground">
            Welcome to CPG-CMS. Choose a password to finish setting up your
            account.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="w-full bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
