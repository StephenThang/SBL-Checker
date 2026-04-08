# SBL Checker

SBL Checker is a production-style MVP for reviewing hypertrophy and lifting claims against a curated evidence library and a live research retrieval layer.

## Features

- Source fact-checking for lifting and hypertrophy claims
- Structured evidence-alignment score from `1-10`
- Citation-backed verdicts with uncertainty notes
- Saved reports in SQLite
- Personalized AI assistant for lifting questions
- Live article retrieval from OpenAlex, Semantic Scholar, and PubMed

## Run locally

From this folder:

```bash
npm.cmd run db:generate
npm.cmd run db:push
npm.cmd run db:seed
npm.cmd run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Optional AI configuration

To enable OpenAI-powered assistant responses, set:

```bash
OPENAI_API_KEY=your_key_here
```

Optional research API keys:

```bash
OPENALEX_API_KEY=your_key_here
S2_API_KEY=your_key_here
```

Without `OPENAI_API_KEY`, the assistant still returns a structured fallback summary using the retrieved articles.

## Verification

- `npm test`
- `npm run lint`
- `npm run build`

## App structure

- `src/orchestrator`: job flow and analysis stages
- `src/specification`: input validation and claim extraction
- `src/architecture`: scoring rules
- `src/implementation`: evidence matching, article retrieval, assistant logic
- `src/testing`: validation layer
- `src/evaluation`: risk and technical-debt output
- `src/ui`: product UI
