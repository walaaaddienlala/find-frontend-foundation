/**
 * Uniform result type for the service layer. Services never throw for expected
 * failures; callers render the matching empty / error / unauthorized state.
 * IMPLEMENTED (pure, tested).
 */
export type ServiceErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_configured"
  | "not_found"
  | "validation"
  | "unavailable";

export type ServiceError = { code: ServiceErrorCode; message: string };

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(
  code: ServiceErrorCode,
  message: string,
): ServiceResult<T> {
  return { ok: false, error: { code, message } };
}

/** Returned by every scaffolded service method until it is implemented. */
export function notConfigured<T = never>(feature: string): ServiceResult<T> {
  return fail<T>(
    "not_configured",
    `${feature} is scaffolded but not implemented yet.`,
  );
}
