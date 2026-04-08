import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await prisma.analysisResult.findUnique({
    where: { jobId: id },
    include: { job: true },
  });

  if (!result) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  return NextResponse.json({
    analysisId: result.id,
    jobId: result.jobId,
    url: result.job.url,
    score: result.score,
    label: result.label,
    confidenceBand: result.confidenceBand,
    summary: JSON.parse(result.summaryJson),
    verdicts: JSON.parse(result.verdictsJson),
    testing: JSON.parse(result.testingJson),
    evaluation: JSON.parse(result.evaluationJson),
    telemetry: JSON.parse(result.telemetryJson),
    disclaimer: result.disclaimer,
  });
}
