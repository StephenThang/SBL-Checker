import type { BuildLogEntry } from "@/domain/sbl/types";

export function createLogEntry(
  stage: string,
  status: BuildLogEntry["status"],
  message: string,
  durationMs?: number,
): BuildLogEntry {
  return {
    stage,
    status,
    message,
    durationMs,
    timestamp: new Date().toISOString(),
  };
}
