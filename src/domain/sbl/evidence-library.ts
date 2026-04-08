import type { EvidenceClaimSeed, EvidenceSourceSeed } from "@/domain/sbl/types";

export const evidenceSources: EvidenceSourceSeed[] = [
  {
    id: "src-dose-response-2025",
    title:
      "The Resistance Training Dose Response: Meta-Regressions Exploring Weekly Volume",
    citation:
      "Sports Medicine DOI: 10.1007/s40279-025-02344-w",
    url: "https://doi.org/10.1007/s40279-025-02344-w",
    year: 2025,
    studyType: "Meta-regression",
    qualityBand: "strong",
    topics: ["volume", "intensity"],
    summary:
      "Weekly training volume appears related to hypertrophy, but the relationship is nuanced and not well represented by slogans claiming one universally optimal low-volume prescription.",
  },
  {
    id: "src-failure-review-2022",
    title: "Frontiers mini review on resistance training and proximity to failure",
    citation: "Frontiers in Sports and Active Living DOI: 10.3389/fspor.2022.949021",
    url: "https://doi.org/10.3389/fspor.2022.949021/pdf",
    year: 2022,
    studyType: "Mini review",
    qualityBand: "moderate",
    topics: ["intensity", "failure"],
    summary:
      "Training close to failure is relevant for muscle growth, but absolute failure on every set is not a universal requirement in the literature.",
  },
  {
    id: "src-fiber-preprint",
    title: "Preprint on muscle fiber understanding and training design",
    citation:
      "Preprint hosted via cloudfront research document on muscle fiber types",
    url: "https://d197for5662m48.cloudfront.net/documents/publicationstatus/229888/preprint_pdf/2ee8f180c742d0add7fac274733fe4f6.pdf",
    studyType: "Preprint",
    qualityBand: "emerging",
    topics: ["fiber-type", "intensity"],
    summary:
      "Fiber-type discussions can shape exercise selection and loading strategies, but the presence of a preprint means conclusions should be treated as emerging rather than definitive.",
  },
  {
    id: "src-carb-position-2025",
    title: "Sports nutrition position material on dietary carbohydrates",
    citation: "Sports Medicine DOI: 10.1007/s40279-025-02213-6",
    url: "https://doi.org/10.1007/s40279-025-02213-6",
    year: 2025,
    studyType: "Position stand / review",
    qualityBand: "strong",
    topics: ["carbohydrate", "nutrition", "recovery"],
    summary:
      "Carbohydrates matter for performance and recovery context, but timing claims should be treated with more nuance than blanket promises of hypertrophy magic.",
  },
  {
    id: "src-carb-hypertrophy-2025",
    title: "The Effect of Carbohydrate Intake on Muscle Hypertrophy: A Systematic Review and Meta-analysis",
    citation: "Sports Medicine DOI: 10.1007/s40279-025-02341-z",
    url: "https://doi.org/10.1007/s40279-025-02341-z",
    year: 2025,
    studyType: "Systematic review and meta-analysis",
    qualityBand: "strong",
    topics: ["carbohydrate", "nutrition"],
    summary:
      "Carbohydrate intake can support training performance, but hypertrophy outcomes should not be reduced to carbohydrate amount alone when total diet and training quality differ.",
  },
  {
    id: "src-sleep-2026",
    title:
      "Strengthening recovery, enduring sleep: ecological assessment of sleep quantity and quality",
    citation: "European Journal of Applied Physiology DOI: 10.1007/s00421-026-06187-9",
    url: "https://doi.org/10.1007/s00421-026-06187-9",
    year: 2026,
    studyType: "Applied physiology study",
    qualityBand: "moderate",
    topics: ["sleep", "recovery"],
    summary:
      "Sleep quantity and quality remain relevant to recovery, appetite regulation, and training readiness, so dismissing sleep as irrelevant to growth is not evidence-aligned.",
  },
  {
    id: "src-whey-review-2022",
    title: "Muscle-Related Effect of Whey Protein Supplementation",
    citation:
      "Nutrients 2022 review with Chen, Liang, Guo, Meng, Qiu, and Benardot",
    url: "https://mdpi-res.com/d_attachment/nutrients/nutrients-14-02289/article_deploy/nutrients-14-02289-v2.pdf?version=1654048785",
    year: 2022,
    studyType: "Review",
    qualityBand: "moderate",
    topics: ["protein", "nutrition"],
    summary:
      "Whey can be a practical protein source, but supplementation is a convenience tool rather than a mandatory prerequisite for hypertrophy.",
  },
];

export const evidenceClaims: EvidenceClaimSeed[] = [
  {
    id: "claim-volume-nuance",
    sourceId: "src-dose-response-2025",
    topic: "volume",
    statement:
      "Dose-response evidence usually supports nuance around weekly volume rather than one universally optimal low-volume template.",
    implication:
      "Claims that low volume is always the best approach for every natural lifter should be rated as overstated.",
    caution:
      "Diminishing returns still matter, so 'more is always better' is also not evidence-aligned.",
    confidence: 0.92,
  },
  {
    id: "claim-intensity-support",
    sourceId: "src-failure-review-2022",
    topic: "intensity",
    statement:
      "Training effort and proximity to failure matter for hypertrophy, especially when loads are moderate to high.",
    implication:
      "Creators emphasizing hard sets and effort usually align better with the evidence than creators minimizing intensity entirely.",
    confidence: 0.83,
  },
  {
    id: "claim-failure-nuance",
    sourceId: "src-failure-review-2022",
    topic: "failure",
    statement:
      "The literature does not support the blanket idea that every set must reach absolute failure for maximal growth.",
    implication:
      "All-or-nothing recommendations around failure should be marked as mixed rather than fully supported.",
    confidence: 0.87,
  },
  {
    id: "claim-carb-nuance",
    sourceId: "src-carb-hypertrophy-2025",
    topic: "carbohydrate",
    statement:
      "Carbohydrate intake can affect training quality and recovery, but carbohydrate intake alone does not settle hypertrophy outcomes in isolation.",
    implication:
      "Claims that carbs are either the sole driver of growth or completely irrelevant should both be downgraded.",
    confidence: 0.89,
  },
  {
    id: "claim-sleep-recovery",
    sourceId: "src-sleep-2026",
    topic: "sleep",
    statement:
      "Sleep quantity and quality meaningfully affect recovery context and should not be dismissed in physique discussions.",
    implication:
      "Advice claiming poor sleep does not matter for progress should be contradicted.",
    confidence: 0.84,
  },
  {
    id: "claim-protein-practical",
    sourceId: "src-whey-review-2022",
    topic: "protein",
    statement:
      "Whey protein is a useful dietary tool, but it is not mandatory when total protein intake can be met through other foods.",
    implication:
      "Mandatory supplement rhetoric should be downgraded as overly strong.",
    confidence: 0.8,
  },
  {
    id: "claim-fiber-caution",
    sourceId: "src-fiber-preprint",
    topic: "fiber-type",
    statement:
      "Fiber-type reasoning can inform programming conversations, but preprint-level evidence should be presented as tentative.",
    implication:
      "Creators using fiber-type language as settled proof for sweeping prescriptions should be marked as speculative.",
    confidence: 0.58,
  },
];
