import { prisma } from "@/lib/prisma";
import { safeParseJson } from "@/lib/json";
import type { FullAnalysis } from "@/domain/sbl/types";

export async function getRecentAnalyses() {
  const analyses = await prisma.analysisResult.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { job: true },
  });

  return analyses.map((analysis) => ({
    jobId: analysis.jobId,
    url: analysis.job.url,
    score: analysis.score,
    label: analysis.label,
    createdAt: analysis.createdAt.toLocaleDateString(),
  }));
}

export async function getAnalysisByJobId(jobId: string): Promise<FullAnalysis | null> {
  const result = await prisma.analysisResult.findUnique({
    where: { jobId },
  });

  if (!result) {
    return null;
  }

  return {
    summary: safeParseJson(result.summaryJson, null),
    verdicts: safeParseJson(result.verdictsJson, []),
    telemetry: safeParseJson(result.telemetryJson, null),
    testing: safeParseJson(result.testingJson, null),
    evaluation: safeParseJson(result.evaluationJson, null),
    disclaimer: result.disclaimer,
  } as unknown as FullAnalysis;
}
