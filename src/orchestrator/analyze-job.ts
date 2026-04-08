import { buildSummary } from "@/implementation/report-builder";
import { evidenceClaims, evidenceSources } from "@/domain/sbl/evidence-library";
import { matchClaimsToEvidence } from "@/implementation/evidence-matcher";
import { createLogEntry } from "@/orchestrator/logging";
import { evaluateAnalysis } from "@/evaluation/evaluate-analysis";
import { runValidationChecks } from "@/testing/validation";
import { extractClaims } from "@/specification/claims";
import { normalizeInput } from "@/specification/input";
import { prisma } from "@/lib/prisma";
import { serializeJson } from "@/lib/json";
import type {
  BuildLogEntry,
  BuildTelemetry,
  FullAnalysis,
  JobStatus,
  NormalizedInput,
} from "@/domain/sbl/types";

async function ensureEvidenceSeeded() {
  const sourceCount = await prisma.sourceDocument.count();
  if (sourceCount > 0) {
    return;
  }

  await prisma.$transaction([
    ...evidenceSources.map((source) =>
      prisma.sourceDocument.create({
        data: {
          id: source.id,
          title: source.title,
          citation: source.citation,
          url: source.url,
          year: source.year,
          studyType: source.studyType,
          qualityBand: source.qualityBand,
          topicsJson: serializeJson(source.topics),
          summary: source.summary,
        },
      }),
    ),
    ...evidenceClaims.map((claim) =>
      prisma.evidenceClaim.create({
        data: {
          id: claim.id,
          sourceId: claim.sourceId,
          topic: claim.topic,
          statement: claim.statement,
          implication: claim.implication,
          caution: claim.caution,
          confidence: claim.confidence,
        },
      }),
    ),
  ]);
}

async function getLibraryClaims() {
  const claims = await prisma.evidenceClaim.findMany({
    include: { source: true },
  });

  return claims.map((claim) => ({
    id: claim.id,
    sourceId: claim.sourceId,
    title: claim.source.title,
    citation: claim.source.citation,
    url: claim.source.url,
    topic: claim.topic as never,
    statement: claim.statement,
    implication: claim.implication,
    caution: claim.caution,
    confidence: claim.confidence,
  }));
}

async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  logs: BuildLogEntry[],
  attempts: number,
) {
  await prisma.analysisJob.update({
    where: { id: jobId },
    data: {
      status,
      logsJson: serializeJson(logs),
      attempts,
    },
  });
}

export async function runAnalysisJob(payload: unknown) {
  await ensureEvidenceSeeded();

  const normalized = normalizeInput(payload);
  if (!normalized.data) {
    return {
      status: 400,
      body: { errors: normalized.errors },
    };
  }

  const data: NormalizedInput = normalized.data;
  const start = Date.now();
  const logs: BuildLogEntry[] = [];
  let attempts = 0;

  const job = await prisma.analysisJob.create({
    data: {
      url: data.url,
      sourceType: data.sourceType,
      status: "queued",
      inputTranscript: data.transcript,
      manualClaims: data.manualClaims,
      warningsJson: serializeJson(normalized.warnings),
      logsJson: serializeJson([]),
    },
  });

  const stage = async (
    name: JobStatus,
    message: string,
    runner?: () => Promise<void>,
  ) => {
    const stageStart = Date.now();
    logs.push(createLogEntry(name, "started", message));
    await updateJobStatus(job.id, name, logs, attempts);
    try {
      await runner?.();
      logs.push(
        createLogEntry(name, "completed", `${message} complete.`, Date.now() - stageStart),
      );
    } catch (error) {
      logs.push(
        createLogEntry(
          name,
          "failed",
          error instanceof Error ? error.message : "Unknown analysis failure.",
          Date.now() - stageStart,
        ),
      );
      throw error;
    } finally {
      await updateJobStatus(job.id, name, logs, attempts);
    }
  };

  try {
    let verdicts = [] as FullAnalysis["verdicts"];
    let warnings = [...normalized.warnings];

    await stage("specifying", "Normalizing input and extracting claims", async () => {
      const extracted = extractClaims(data);
      warnings = [...warnings, ...extracted.warnings];
      const libraryClaims = await getLibraryClaims();

      await stage("architecting", "Mapping claims to evidence domains");
      await stage("implementing", "Comparing claims against curated evidence", async () => {
        verdicts = matchClaimsToEvidence(extracted.claims, libraryClaims);
      });
    });

    const testing = runValidationChecks(verdicts, warnings);
    await stage("testing", "Running internal validation checks");

    const summary = buildSummary(verdicts, warnings);
    const telemetry: BuildTelemetry = {
      status: "completed",
      retries: attempts,
      totalDurationMs: Date.now() - start,
      logs,
    };

    const fullAnalysis: FullAnalysis = {
      summary,
      verdicts,
      telemetry,
      testing,
      evaluation: {
        maintainability: [],
        scalabilityRisks: [],
        securityConcerns: [],
        refactoringOpportunities: [],
        nextIterationRoadmap: [],
      },
      disclaimer:
        "Educational use only. This report summarizes a curated evidence set and is not a substitute for medical advice, individualized coaching, or a full systematic review.",
    };

    await stage("evaluating", "Reviewing maintainability and deployment risks", async () => {
      fullAnalysis.evaluation = evaluateAnalysis(fullAnalysis);
    });

    await prisma.analysisResult.create({
      data: {
        jobId: job.id,
        score: summary.overallScore,
        label: summary.label,
        confidenceBand: summary.confidenceBand,
        summaryJson: serializeJson(summary),
        verdictsJson: serializeJson(verdicts),
        testingJson: serializeJson(testing),
        evaluationJson: serializeJson(fullAnalysis.evaluation),
        telemetryJson: serializeJson({ ...telemetry, status: "completed", logs }),
        disclaimer: fullAnalysis.disclaimer,
      },
    });

    logs.push(createLogEntry("completed", "completed", "Analysis complete."));
    await updateJobStatus(job.id, "completed", logs, attempts);

    return {
      status: 200,
      body: {
        jobId: job.id,
        status: "completed",
      },
    };
  } catch (error) {
    attempts += 1;
    logs.push(createLogEntry("implementing", "retry", "Retry budget exhausted."));
    logs.push(
      createLogEntry(
        "failed",
        "failed",
        error instanceof Error ? error.message : "Unknown analysis failure.",
      ),
    );
    await updateJobStatus(job.id, "failed", logs, attempts);

    return {
      status: 500,
      body: {
        errors: ["The analysis pipeline failed before a report could be generated."],
      },
    };
  }
}
