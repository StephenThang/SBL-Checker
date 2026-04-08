import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { safeParseJson } from "@/lib/json";
import { AnalysisView } from "@/ui/results/analysis-view";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await prisma.analysisResult.findUnique({
    where: { jobId: id },
  });

  if (!result) {
    notFound();
  }

  const analysis = {
    summary: safeParseJson(result.summaryJson, {}),
    verdicts: safeParseJson(result.verdictsJson, []),
    telemetry: safeParseJson(result.telemetryJson, { logs: [] }),
    testing: safeParseJson(result.testingJson, { checks: [] }),
    evaluation: safeParseJson(result.evaluationJson, {
      maintainability: [],
      scalabilityRisks: [],
      securityConcerns: [],
      refactoringOpportunities: [],
      nextIterationRoadmap: [],
    }),
    disclaimer: result.disclaimer,
  };

  return <AnalysisView jobId={id} analysis={analysis as never} />;
}
