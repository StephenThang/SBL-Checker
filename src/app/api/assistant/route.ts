import { NextResponse } from "next/server";
import { z } from "zod";

import { generatePersonalizedAssistantAnswer } from "@/implementation/assistant-service";

const assistantSchema = z.object({
  question: z.string().min(10).max(1000),
  profile: z.object({
    goal: z.string().min(1).max(120),
    trainingAge: z.string().min(1).max(120),
    weeklyFrequency: z.string().min(1).max(120),
    equipment: z.string().min(1).max(120),
    recoveryPriority: z.string().min(1).max(120),
  }),
});

export async function POST(request: Request) {
  const payload = assistantSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { errors: payload.error.issues.map((issue) => issue.message) },
      { status: 400 },
    );
  }

  const result = await generatePersonalizedAssistantAnswer(
    payload.data.question,
    payload.data.profile,
  );

  return NextResponse.json(result);
}
