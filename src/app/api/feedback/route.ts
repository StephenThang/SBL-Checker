import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const feedbackSchema = z.object({
  analysisId: z.string().min(1),
  rating: z.number().min(1).max(5),
  helpfulness: z.string().min(1),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const payload = feedbackSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { errors: payload.error.issues.map((issue) => issue.message) },
      { status: 400 },
    );
  }

  const analysis = await prisma.analysisResult.findUnique({
    where: { jobId: payload.data.analysisId },
  });

  if (!analysis) {
    return NextResponse.json({ errors: ["Analysis not found."] }, { status: 404 });
  }

  await prisma.userFeedback.create({
    data: {
      analysisId: analysis.id,
      rating: payload.data.rating,
      helpfulness: payload.data.helpfulness,
      notes: payload.data.notes || null,
    },
  });

  return NextResponse.json({ ok: true });
}
