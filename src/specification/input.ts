import { z } from "zod";

import type { NormalizedInput, SourceType } from "@/domain/sbl/types";

const inputSchema = z.object({
  url: z.string().url("Enter a valid URL."),
  transcript: z.string().max(12000).optional().or(z.literal("")),
  manualClaims: z.string().max(6000).optional().or(z.literal("")),
  sourceType: z.enum(["video", "article", "social", "unknown"]).optional(),
});

function inferSourceType(url: string): SourceType {
  if (/(youtube|youtu\.be|vimeo|tiktok)/i.test(url)) {
    return "video";
  }

  if (/(instagram|x\.com|twitter|threads)/i.test(url)) {
    return "social";
  }

  if (/medium|substack|\.org|\.edu|blog/i.test(url)) {
    return "article";
  }

  return "unknown";
}

export function normalizeInput(payload: unknown): {
  data?: NormalizedInput;
  warnings: string[];
  errors: string[];
} {
  const parsed = inputSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      warnings: [],
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const transcript = parsed.data.transcript?.trim() || undefined;
  const manualClaims = parsed.data.manualClaims?.trim() || undefined;
  const warnings =
    !transcript && !manualClaims
      ? [
          "No transcript or pasted claims were provided. The report can still run, but confidence will be limited.",
        ]
      : [];

  return {
    warnings,
    errors: [],
    data: {
      url: parsed.data.url,
      transcript,
      manualClaims,
      sourceType: parsed.data.sourceType ?? inferSourceType(parsed.data.url),
    },
  };
}
