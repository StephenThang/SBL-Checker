import type { PersonalizationProfile, ResearchArticle } from "@/domain/sbl/types";

function scoreEvidenceLevel(
  title: string,
  abstract?: string,
): ResearchArticle["evidenceLevel"] {
  const text = `${title} ${abstract ?? ""}`.toLowerCase();

  if (text.includes("meta-analysis")) {
    return "meta-analysis";
  }

  if (text.includes("systematic review")) {
    return "systematic-review";
  }

  if (text.includes("review")) {
    return "review";
  }

  if (text.includes("randomized") || text.includes("trial")) {
    return "trial";
  }

  if (
    text.includes("cohort") ||
    text.includes("cross-sectional") ||
    text.includes("observational")
  ) {
    return "observational";
  }

  return "unknown";
}

function evidenceWeight(level: ResearchArticle["evidenceLevel"]) {
  switch (level) {
    case "meta-analysis":
      return 1;
    case "systematic-review":
      return 0.95;
    case "review":
      return 0.8;
    case "trial":
      return 0.75;
    case "observational":
      return 0.55;
    default:
      return 0.4;
  }
}

function extractResearchTerms(question: string, profile: PersonalizationProfile) {
  const text = `${question} ${profile.goal} ${profile.recoveryPriority}`.toLowerCase();
  const terms = ["resistance training", "muscle hypertrophy"];

  const topicGroups = [
    "volume",
    "sets",
    "intensity",
    "failure",
    "recovery",
    "sleep",
    "protein",
    "carbohydrate",
    "frequency",
    "natural lifter",
  ];

  for (const term of topicGroups) {
    if (text.includes(term)) {
      terms.push(term);
    }
  }

  if (text.includes("strength")) {
    terms.push("strength training");
  }

  return [...new Set(terms)];
}

function buildSearchQuery(question: string, profile: PersonalizationProfile) {
  return extractResearchTerms(question, profile).join(" ");
}

function computeTopicRelevance(article: ResearchArticle, terms: string[]) {
  const haystack = `${article.title} ${article.abstract ?? ""} ${article.journal ?? ""}`.toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (haystack.includes(term.toLowerCase())) {
      score += 1;
    }
  }

  if (haystack.includes("hypertrophy")) score += 2;
  if (haystack.includes("resistance training")) score += 2;
  if (haystack.includes("strength training")) score += 1.5;
  if (haystack.includes("muscle")) score += 1;

  return score;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "User-Agent": "SBL-Checker/1.0",
        ...(init?.headers ?? {}),
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function searchOpenAlex(query: string): Promise<ResearchArticle[]> {
  const apiKey = process.env.OPENALEX_API_KEY;
  const apiParam = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : "";
  const url =
    `https://api.openalex.org/works?search=${encodeURIComponent(query)}` +
    `&sort=publication_date:desc&per-page=6${apiParam}`;

  const data = await fetchJson<{
    results?: Array<{
      id: string;
      title: string;
      publication_year?: number;
      primary_location?: {
        landing_page_url?: string;
        source?: { display_name?: string };
      };
      abstract?: string;
      abstract_inverted_index?: Record<string, number[]>;
    }>;
  }>(url);

  if (!data?.results) {
    return [];
  }

  return data.results.map((item) => {
    const abstract =
      item.abstract ??
      (item.abstract_inverted_index
        ? Object.entries(item.abstract_inverted_index)
            .flatMap(([word, indexes]) =>
              indexes.map((index) => ({ word, index })),
            )
            .sort((a, b) => a.index - b.index)
            .map(({ word }) => word)
            .join(" ")
        : undefined);
    const evidenceLevel = scoreEvidenceLevel(item.title, abstract);

    return {
      id: item.id,
      title: item.title,
      abstract,
      year: item.publication_year,
      source: "openalex",
      url: item.primary_location?.landing_page_url ?? item.id,
      journal: item.primary_location?.source?.display_name,
      evidenceLevel,
      relevanceScore: evidenceWeight(evidenceLevel),
    };
  });
}

async function searchSemanticScholar(query: string): Promise<ResearchArticle[]> {
  const headers: Record<string, string> = {};
  if (process.env.S2_API_KEY) {
    headers["x-api-key"] = process.env.S2_API_KEY;
  }

  const url =
    `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}` +
    `&limit=6&fields=title,abstract,year,url,venue`;

  const data = await fetchJson<{
    data?: Array<{
      paperId: string;
      title: string;
      abstract?: string;
      year?: number;
      url?: string;
      venue?: string;
    }>;
  }>(url, { headers });

  if (!data?.data) {
    return [];
  }

  return data.data.map((item) => {
    const evidenceLevel = scoreEvidenceLevel(item.title, item.abstract);
    return {
      id: item.paperId,
      title: item.title,
      abstract: item.abstract,
      year: item.year,
      source: "semantic-scholar",
      url: item.url ?? `https://www.semanticscholar.org/paper/${item.paperId}`,
      journal: item.venue,
      evidenceLevel,
      relevanceScore: evidenceWeight(evidenceLevel),
    };
  });
}

async function searchPubMed(query: string): Promise<ResearchArticle[]> {
  const search = await fetchJson<{
    esearchresult?: { idlist?: string[] };
  }>(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&sort=pub+date&retmax=6&term=${encodeURIComponent(query)}`,
  );

  const ids = search?.esearchresult?.idlist ?? [];
  if (ids.length === 0) {
    return [];
  }

  const summaries = await fetchJson<{
    result?: Record<
      string,
      {
        uid?: string;
        title?: string;
        pubdate?: string;
        fulljournalname?: string;
        articleids?: Array<{ idtype?: string; value?: string }>;
      }
    >;
  }>(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`,
  );

  if (!summaries?.result) {
    return [];
  }

  return ids
    .map((id) => summaries.result?.[id])
    .filter(Boolean)
    .map((item) => {
      const title = item?.title ?? "Untitled PubMed result";
      const doi = item?.articleids?.find(
        (articleId) => articleId.idtype === "doi",
      )?.value;
      const evidenceLevel = scoreEvidenceLevel(title);

      return {
        id: item?.uid ?? title,
        title,
        year: item?.pubdate
          ? Number.parseInt(item.pubdate.slice(0, 4), 10)
          : undefined,
        source: "pubmed" as const,
        url: doi
          ? `https://doi.org/${doi}`
          : `https://pubmed.ncbi.nlm.nih.gov/${item?.uid}/`,
        journal: item?.fulljournalname,
        evidenceLevel,
        relevanceScore: evidenceWeight(evidenceLevel),
      };
    });
}

export function dedupeArticles(articles: ResearchArticle[]) {
  const seen = new Set<string>();

  return articles.filter((article) => {
    const key = article.title.trim().toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function searchLatestResearch(
  question: string,
  profile: PersonalizationProfile,
): Promise<{ query: string; articles: ResearchArticle[] }> {
  const query = buildSearchQuery(question, profile);
  const terms = extractResearchTerms(question, profile);
  const [openAlex, semanticScholar, pubmed] = await Promise.all([
    searchOpenAlex(query),
    searchSemanticScholar(query),
    searchPubMed(query),
  ]);

  const articles = dedupeArticles([...openAlex, ...semanticScholar, ...pubmed])
    .map((article) => ({
      ...article,
      relevanceScore: article.relevanceScore + computeTopicRelevance(article, terms),
    }))
    .filter((article) => article.relevanceScore >= 2)
    .sort((left, right) => {
      const yearDiff = (right.year ?? 0) - (left.year ?? 0);
      if (yearDiff !== 0) {
        return yearDiff;
      }
      return right.relevanceScore - left.relevanceScore;
    })
    .slice(0, 8);

  return { query, articles };
}
