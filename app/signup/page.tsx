"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function BrandPanel() {
  return (
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
  );
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // read by handle_new_user() trigger to populate profiles.name
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is enabled in your Supabase Auth settings,
    // data.session will be null here — the user must confirm via email
    // before they can sign in. If confirmation is disabled, session exists
    // immediately and we can route straight in.
    if (data.session) {
      router.push("/guidelines");
      router.refresh();
    } else {
      setSubmitted(true);
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F3F0E8] via-[#F6EFE4] to-[#EFE2D3] p-6">
        <div className="grid w-full max-w-3xl grid-cols-2 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
          <BrandPanel />

          <div className="flex flex-col justify-center px-9 py-12 text-center">
            <h1 className="text-xl font-bold text-foreground">
              Check your email
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Click it to activate your account, then sign in.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm text-emerald-700 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F3F0E8] via-[#F6EFE4] to-[#EFE2D3] p-6">
      <div className="grid w-full max-w-3xl grid-cols-2 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
        <BrandPanel />

        <div className="flex flex-col justify-center px-9 py-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground">Join CPG-CMS</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-700 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
