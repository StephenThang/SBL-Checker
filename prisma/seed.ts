import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../src/generated/prisma/client";
import { evidenceClaims, evidenceSources } from "../src/domain/sbl/evidence-library";
import { resolveDatabasePath } from "../src/lib/database-path";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: resolveDatabasePath() }),
});

async function main() {
  await prisma.userFeedback.deleteMany();
  await prisma.analysisResult.deleteMany();
  await prisma.analysisJob.deleteMany();
  await prisma.evidenceClaim.deleteMany();
  await prisma.sourceDocument.deleteMany();

  for (const source of evidenceSources) {
    await prisma.sourceDocument.create({
      data: {
        id: source.id,
        title: source.title,
        citation: source.citation,
        url: source.url,
        year: source.year,
        studyType: source.studyType,
        qualityBand: source.qualityBand,
        topicsJson: JSON.stringify(source.topics),
        summary: source.summary,
      },
    });
  }

  for (const claim of evidenceClaims) {
    await prisma.evidenceClaim.create({
      data: {
        id: claim.id,
        sourceId: claim.sourceId,
        topic: claim.topic,
        statement: claim.statement,
        implication: claim.implication,
        caution: claim.caution,
        confidence: claim.confidence,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
