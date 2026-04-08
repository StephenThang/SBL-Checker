export type SourceType = "video" | "article" | "social" | "unknown";

export type EvidenceTopic =
  | "volume"
  | "intensity"
  | "failure"
  | "nutrition"
  | "carbohydrate"
  | "protein"
  | "sleep"
  | "recovery"
  | "fiber-type";

export type ClaimVerdictType =
  | "supported"
  | "mixed"
  | "contradicted"
  | "unverifiable";

export type JobStatus =
  | "queued"
  | "specifying"
  | "architecting"
  | "implementing"
  | "testing"
  | "evaluating"
  | "completed"
  | "failed";

export interface NormalizedInput {
  url: string;
  transcript?: string;
  manualClaims?: string;
  sourceType: SourceType;
}

export interface ExtractedClaim {
  id: string;
  text: string;
  topics: EvidenceTopic[];
  confidence: number;
  source: "transcript" | "manual" | "fallback";
}

export interface EvidenceSourceSeed {
  id: string;
  title: string;
  citation: string;
  url: string;
  year?: number;
  studyType: string;
  qualityBand: "strong" | "moderate" | "emerging";
  topics: EvidenceTopic[];
  summary: string;
}

export interface EvidenceClaimSeed {
  id: string;
  sourceId: string;
  topic: EvidenceTopic;
  statement: string;
  implication: string;
  caution?: string;
  confidence: number;
}

export interface EvidenceMatch {
  evidenceId: string;
  sourceId: string;
  title: string;
  citation: string;
  url: string;
  topic: EvidenceTopic;
  statement: string;
  implication: string;
  caution?: string;
  confidence: number;
}

export interface ClaimVerdict {
  claimId: string;
  claim: string;
  verdict: ClaimVerdictType;
  scoreImpact: number;
  rationale: string;
  topics: EvidenceTopic[];
  supportingEvidence: EvidenceMatch[];
}

export interface AnalysisSummary {
  overallScore: number;
  label: "Evidence-Aligned" | "Mixed Evidence" | "Weakly Supported";
  confidenceBand: "High" | "Moderate" | "Low";
  overview: string;
  whatWasRight: string[];
  whatWasOverstated: string[];
  whatWasMissing: string[];
  warnings: string[];
  estimatedTimeline: string;
}

export interface BuildLogEntry {
  stage: string;
  status: "started" | "completed" | "failed" | "retry";
  message: string;
  timestamp: string;
  durationMs?: number;
}

export interface BuildTelemetry {
  status: JobStatus;
  retries: number;
  totalDurationMs: number;
  logs: BuildLogEntry[];
}

export interface TestingReport {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
}

export interface EvaluationReport {
  maintainability: string[];
  scalabilityRisks: string[];
  securityConcerns: string[];
  refactoringOpportunities: string[];
  nextIterationRoadmap: string[];
}

export interface FullAnalysis {
  summary: AnalysisSummary;
  verdicts: ClaimVerdict[];
  telemetry: BuildTelemetry;
  testing: TestingReport;
  evaluation: EvaluationReport;
  disclaimer: string;
}

export interface PersonalizationProfile {
  goal: string;
  trainingAge: string;
  weeklyFrequency: string;
  equipment: string;
  recoveryPriority: string;
}

export interface ResearchArticle {
  id: string;
  title: string;
  abstract?: string;
  year?: number;
  source: "openalex" | "semantic-scholar" | "pubmed";
  url: string;
  journal?: string;
  evidenceLevel:
    | "meta-analysis"
    | "systematic-review"
    | "review"
    | "trial"
    | "observational"
    | "unknown";
  relevanceScore: number;
}

export interface AssistantResponsePayload {
  answer: string;
  bullets: string[];
  cautions: string[];
  suggestedActions: string[];
  searchQuery: string;
  articles: ResearchArticle[];
  usedAi: boolean;
}
