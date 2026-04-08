import type {
  ClaimVerdict,
  ClaimVerdictType,
  EvidenceMatch,
  EvidenceTopic,
  ExtractedClaim,
} from "@/domain/sbl/types";

interface LibraryClaim {
  id: string;
  sourceId: string;
  title: string;
  citation: string;
  url: string;
  topic: EvidenceTopic;
  statement: string;
  implication: string;
  caution?: string | null;
  confidence: number;
}

function verdictFromClaimText(text: string, topic: EvidenceTopic): ClaimVerdictType {
  const lower = text.toLowerCase();

  if (topic === "volume") {
    if (/low volume.*optimal|one set.*best|minimal volume.*best/.test(lower)) {
      return "contradicted";
    }
    if (/more volume.*always|unlimited volume/.test(lower)) {
      return "contradicted";
    }
    return "mixed";
  }

  if (topic === "intensity") {
    if (/high intensity|hard sets|close to failure/.test(lower)) {
      return "supported";
    }
    if (/intensity doesn't matter|light effort is enough/.test(lower)) {
      return "contradicted";
    }
    return "mixed";
  }

  if (topic === "failure") {
    if (/every set.*failure|must train to failure/.test(lower)) {
      return "mixed";
    }
    if (/never train close to failure/.test(lower)) {
      return "contradicted";
    }
    return "mixed";
  }

  if (topic === "carbohydrate") {
    if (/carbs.*only thing|carbs.*sole driver/.test(lower)) {
      return "contradicted";
    }
    if (/carbs don't matter|zero carbs.*same muscle/.test(lower)) {
      return "contradicted";
    }
    return "mixed";
  }

  if (topic === "sleep" || topic === "recovery") {
    if (/sleep.*doesn't matter|recovery.*irrelevant/.test(lower)) {
      return "contradicted";
    }
    if (/sleep matters|recovery matters/.test(lower)) {
      return "supported";
    }
    return "mixed";
  }

  if (topic === "protein") {
    if (/whey.*mandatory|supplements.*required/.test(lower)) {
      return "contradicted";
    }
    return "mixed";
  }

  if (topic === "fiber-type") {
    if (/fiber type.*proves|everyone should/.test(lower)) {
      return "mixed";
    }
  }

  return "unverifiable";
}

function scoreImpactForVerdict(verdict: ClaimVerdictType, confidence: number): number {
  const base =
    verdict === "supported"
      ? 9
      : verdict === "mixed"
        ? 5
        : verdict === "contradicted"
          ? 2
          : 4;

  return Math.round(base * (0.75 + confidence * 0.25));
}

function formatRationale(verdict: ClaimVerdictType, match: EvidenceMatch): string {
  if (verdict === "supported") {
    return `${match.statement} ${match.implication}`;
  }

  if (verdict === "contradicted") {
    return `${match.implication} ${match.caution ?? "The current evidence does not support the strength of the original claim."}`;
  }

  if (verdict === "mixed") {
    return `${match.statement} ${match.caution ?? "The topic needs more nuance than the original claim provides."}`;
  }

  return "The app found only indirect evidence for this statement, so the verdict remains low-confidence.";
}

export function matchClaimsToEvidence(
  claims: ExtractedClaim[],
  libraryClaims: LibraryClaim[],
): ClaimVerdict[] {
  return claims.map((claim) => {
    const matches = libraryClaims
      .filter((item) => claim.topics.includes(item.topic))
      .slice(0, 3)
      .map<EvidenceMatch>((item) => ({
        evidenceId: item.id,
        sourceId: item.sourceId,
        title: item.title,
        citation: item.citation,
        url: item.url,
        topic: item.topic,
        statement: item.statement,
        implication: item.implication,
        caution: item.caution ?? undefined,
        confidence: item.confidence,
      }));

    const leadMatch = matches[0];
    const primaryTopic = claim.topics[0];
    const verdict = leadMatch
      ? verdictFromClaimText(claim.text, primaryTopic)
      : "unverifiable";

    return {
      claimId: claim.id,
      claim: claim.text,
      verdict,
      scoreImpact: scoreImpactForVerdict(verdict, claim.confidence),
      rationale: leadMatch
        ? formatRationale(verdict, leadMatch)
        : "No direct evidence match was found in the current curated library for this specific wording.",
      topics: claim.topics,
      supportingEvidence: matches,
    };
  });
}
