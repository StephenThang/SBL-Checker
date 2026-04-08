import path from "node:path";

export function resolveDatabasePath() {
  return path.join(process.cwd(), "prisma", "dev.db");
}
