// === PUBLIC API ===

export type Result<T, E = CliError> = { ok: true; value: T } | { ok: false; error: E };

/** Machine-parseable error. `retryable` tells an agent whether re-running can help. */
export interface CliError {
  code: string;
  message: string;
  retryable: boolean;
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function fail(code: string, message: string, retryable = false): Result<never, CliError> {
  return { ok: false, error: { code, message, retryable } };
}
