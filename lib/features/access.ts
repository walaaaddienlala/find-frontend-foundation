import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import type { FeatureAccess } from "@/lib/features/registry";
import { createClient } from "@/lib/supabase/server";

/**
 * Route-level access check for feature pages. IMPLEMENTED.
 * - public: no check
 * - user: redirects to sign-in (with return path) when signed out
 * - admin: redirects non-admins away (same `has_role` call as the admin layout)
 * Returns "unavailable" when Supabase is not configured so pages can render an
 * error state instead of crashing. Services re-check on their own; never rely on
 * this alone for data access.
 */
export async function enforceFeatureAccess(
  access: FeatureAccess,
  returnTo: string,
): Promise<"ok" | "unavailable"> {
  if (access === "public") return "ok";
  if (!isSupabaseConfigured()) return "unavailable";

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect(`/sign-in?redirectTo=${returnTo}`);

  if (access === "admin") {
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      requested_role: "admin",
    });

    if (roleError || isAdmin !== true) redirect("/opportunities");
  }

  return "ok";
}
