"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Full reload instead of client-side navigation — guarantees the
    // middleware re-checks against the now-committed session cookie,
    // rather than racing a soft navigation against cookie propagation.
    window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F3F0E8] via-[#F6EFE4] to-[#EFE2D3] p-6">
      <div className="grid w-full max-w-3xl grid-cols-2 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
        {/* Left: brand panel */}
        <div className="flex flex-col items-center justify-center gap-4 bg-[#2F6B4F] px-8 py-12">
          <Image
            src="/CPG_mascot.png"
            alt=""
            width={140}
            height={145}
            className="drop-shadow-md"
            priority
          />
          <div className="text-center">
            <p className="text-lg font-bold text-white">CPG-CMS</p>
            <p className="mt-1 text-sm text-white/70">
              Clinical Practice Guideline management
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-center px-9 py-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">Welcome!</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to CPG-CMS
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-emerald-700 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
