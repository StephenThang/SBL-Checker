import { describe, expect, it } from "vitest";

import { normalizeInput } from "@/specification/input";

describe("normalizeInput", () => {
  it("accepts valid URL payloads", () => {
    const result = normalizeInput({
      url: "https://www.youtube.com/watch?v=test",
      transcript: "Low volume is always best for naturals.",
    });

    expect(result.errors).toHaveLength(0);
    expect(result.data?.sourceType).toBe("video");
  });

  it("rejects invalid URLs", () => {
    const result = normalizeInput({
      url: "not-a-url",
    });

    expect(result.errors[0]).toContain("valid URL");
  });
});
