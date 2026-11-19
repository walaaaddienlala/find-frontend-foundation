import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  fail,
  notConfigured,
  ok,
  type ServiceResult,
} from "@/lib/services/result";

/**
 * Server-side authorization helpers for the service layer.
 * IMPLEMENTED. Mirrors the admin layout's check (`has_role` with
 * `requested_role`). Roles other than `admin` (mentor, institution_admin,
 * reviewer, ...) are NOT verified to exist in the database: add them only after
 * the preflight confirms how `has_role` is defined.
 */
export type ServiceAccess = "user" | "admin";

export async function requireUser(): Promise<ServiceResult<{ userId: string }>> {
  if (!isSupabaseConfigured()) {
    return fail("unavailable", "Supabase is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return fail("unauthenticated", "Please sign in.");

  return ok({ userId: user.id });
}

export async function requireAdmin(): Promise<ServiceResult<{ userId: string }>> {
  const session = await requireUser();
  if (!session.ok) return session;

  const supabase = await createClient();
  const { data: isAdmin, error } = await supabase.rpc("has_role", {
    requested_role: "admin",
  });

  if (error || isAdmin !== true) {
    return fail("forbidden", "Administrator access is required.");
  }

  return session;
}

/**
 * Default body for scaffolded service methods: enforce the permission first
 * (so the check survives when the real implementation replaces this), then
 * report that the feature is not implemented.
 */
export async function unimplemented<T = never>(
  feature: string,
  access: ServiceAccess = "user",
): Promise<ServiceResult<T>> {
  const guard = access === "admin" ? await requireAdmin() : await requireUser();

  if (!guard.ok) return guard;

  return notConfigured<T>(feature);
}
