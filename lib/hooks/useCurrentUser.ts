"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../supabase/client";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "author" | "reviewer";
}

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", authUser.id)
    .single();

  return {
    id: authUser.id,
    email: authUser.email!,
    name: profile?.name ?? authUser.email!.split("@")[0],
    role: profile?.role ?? "author",
  };
}

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return { user: query.data ?? null, loading: query.isLoading };
}

export function useInvalidateCurrentUser() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["current-user"] });
}