"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "author" | "reviewer";
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", authUser.id)
        .single();

      setUser({
        id: authUser.id,
        email: authUser.email!,
        name: profile?.name ?? authUser.email!.split("@")[0],
        role: profile?.role ?? "author",
      });
      setLoading(false);
    }
    load();
  }, []);

  return { user, loading };
}