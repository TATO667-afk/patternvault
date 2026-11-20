import { describe, it, expect } from "vitest";
import { resolveVerdict, aggregateTopics, isMastered, nextDifficulty, overallAccuracy, suggestNext, type AttemptRow } from "./progress";

describe("resolveVerdict — deterministic overrides AI", () => {
  it("CAS-verified correct beats any AI label", () => {
    const r = resolveVerdict("incorrect", { type: "equation_roots", expr: "2*x^2-8*x+6", variable: "x", roots: ["1", "3"] });
    expect(r.verdict).toBe("correct");
    expect(r.verified).toBe(true);
  });
  it("CAS-failed marks incorrect even if AI said correct", () => {
    const r = resolveVerdict("correct", { type: "numeric", expression: "(6*8)/2", value: "20" });
    expect(r.verdict).toBe("incorrect");
    expect(r.verified).toBe(true);
  });
  it("falls back to AI when no check", () => {
    expect(resolveVerdict("correct", null).verdict).toBe("correct");
    expect(resolveVerdict("correct", null).verified).toBe(false);
  });
  it("uncertain when nothing to go on", () => {
    expect(resolveVerdict("uncertain", null).verdict).toBe("unverified");
  });
});

describe("mastery + aggregation", () => {
  it("single correct is NOT mastery", () => {
    expect(isMastered(1, 1)).toBe(false);
  });
  it("sustained success is mastery", () => {
    expect(isMastered(5, 5)).toBe(true);
    expect(isMastered(5, 4)).toBe(true);
    expect(isMastered(5, 3)).toBe(false);
  });
  it("aggregates per topic", () => {
    const rows: AttemptRow[] = [
      { topic_id: "a", verdict: "correct", verified: true },
      { topic_id: "a", verdict: "incorrect", verified: true },
      { topic_id: "b", verdict: "correct", verified: false },
    ];
    const agg = aggregateTopics(rows);
    expect(agg.a.attempts).toBe(2);
    expect(agg.a.correct).toBe(1);
    expect(agg.a.rate).toBeCloseTo(0.5);
    expect(agg.b.rate).toBe(1);
  });
  it("overall accuracy", () => {
    const rows: AttemptRow[] = [
      { topic_id: "a", verdict: "correct", verified: true },
      { topic_id: "a", verdict: "incorrect", verified: true },
    ];
    expect(overallAccuracy(rows)).toBe(50);
  });
});

describe("adaptive difficulty", () => {
  it("rises after success, capped at 3", () => {
    expect(nextDifficulty(1, "correct")).toBe(2);
    expect(nextDifficulty(3, "correct")).toBe(3);
  });
  it("drops after a miss, floored at 1", () => {
    expect(nextDifficulty(2, "incorrect")).toBe(1);
    expect(nextDifficulty(1, "incorrect")).toBe(1);
  });
  it("holds on partial/unverified", () => {
    expect(nextDifficulty(2, "partial")).toBe(2);
  });
});

describe("suggestNext", () => {
  it("prefers the weakest attempted topic", () => {
    const rows: AttemptRow[] = [
      { topic_id: "L3-algebra", verdict: "incorrect", verified: true },
      { topic_id: "L3-algebra", verdict: "incorrect", verified: true },
      { topic_id: "L3-func", verdict: "correct", verified: true },
      { topic_id: "L3-func", verdict: "correct", verified: true },
    ];
    const s = suggestNext("3", aggregateTopics(rows));
    expect(s?.topicId).toBe("L3-algebra");
  });
  it("suggests a fresh topic when all attempted are strong", () => {
    const rows: AttemptRow[] = [
      { topic_id: "L3-algebra", verdict: "correct", verified: true },
      { topic_id: "L3-algebra", verdict: "correct", verified: true },
    ];
    const s = suggestNext("3", aggregateTopics(rows));
    expect(s?.topicId).not.toBe("L3-algebra");
  });
});
