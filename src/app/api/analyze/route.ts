import { NextResponse } from "next/server";

import { runAnalysisJob } from "@/orchestrator/analyze-job";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await runAnalysisJob(payload);
  return NextResponse.json(result.body, { status: result.status });
}
