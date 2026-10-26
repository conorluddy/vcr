// Structured JSON-line logging to stderr so stdout stays clean for command output.

export interface LogFields {
  [key: string]: string | number | boolean | null | undefined;
}

export function logEvent(event: string, fields: LogFields = {}): void {
  const line = { time: new Date().toISOString(), event, ...fields };
  process.stderr.write(`${JSON.stringify(line)}\n`);
}

export function startTimer(): () => number {
  const startedAt = performance.now();
  return () => Math.round(performance.now() - startedAt);
}
