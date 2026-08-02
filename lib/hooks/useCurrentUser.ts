"use client";

import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";


export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "author" | "reviewer";
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

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

    // Keep this in sync if the session changes (sign out in another tab, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}