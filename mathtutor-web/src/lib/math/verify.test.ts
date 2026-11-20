import { describe, it, expect } from "vitest";
import { runCheck, type MathCheck } from "./verify";

function v(check: MathCheck) {
  return runCheck(check).status;
}

describe("deterministic verifier — confirms correct answers", () => {
  it("linear equation root", () => {
    expect(v({ type: "equation_roots", expr: "3*x + 6", variable: "x", roots: ["-2"] })).toBe("verified");
  });
  it("quadratic roots", () => {
    expect(v({ type: "equation_roots", expr: "2*x^2 - 8*x + 6", variable: "x", roots: ["1", "3"] })).toBe("verified");
  });
  it("irrational roots", () => {
    expect(v({ type: "equation_roots", expr: "x^2 - 2", variable: "x", roots: ["sqrt(2)", "-sqrt(2)"] })).toBe("verified");
  });
  it("complex roots", () => {
    expect(v({ type: "equation_roots", expr: "x^2 + 1", variable: "x", roots: ["i", "-i"] })).toBe("verified");
  });
  it("simplify / symbolic equivalence", () => {
    expect(v({ type: "simplify", original: "(x^2-9)/(x-3)", result: "x+3", variable: "x" })).toBe("verified");
  });
  it("reordered equivalence 3+x = x+3", () => {
    expect(v({ type: "simplify", original: "x+3", result: "3+x", variable: "x" })).toBe("verified");
  });
  it("factored = expanded", () => {
    expect(v({ type: "simplify", original: "2*x^2-8*x+6", result: "2*(x-1)*(x-3)", variable: "x" })).toBe("verified");
  });
  it("fraction numeric", () => {
    expect(v({ type: "numeric", expression: "1/2 + 1/3", value: "5/6" })).toBe("verified");
  });
  it("derivative", () => {
    expect(v({ type: "derivative", function: "3*x^3 - 5*x^2 + 2*x", variable: "x", result: "9*x^2 - 10*x + 2" })).toBe("verified");
  });
  it("derivative of sin", () => {
    expect(v({ type: "derivative", function: "sin(x)", variable: "x", result: "cos(x)" })).toBe("verified");
  });
  it("integral with +C", () => {
    expect(v({ type: "integral", integrand: "2*x", variable: "x", result: "x^2 + C" })).toBe("verified");
  });
  it("geometry numeric (triangle area)", () => {
    expect(v({ type: "numeric", expression: "(6*8)/2", value: "24" })).toBe("verified");
  });
  it("log numeric", () => {
    expect(v({ type: "numeric", expression: "log(32,2)", value: "5" })).toBe("verified");
  });
});

describe("deterministic verifier — catches wrong answers", () => {
  it("wrong quadratic root", () => {
    expect(v({ type: "equation_roots", expr: "2*x^2 - 8*x + 6", variable: "x", roots: ["1", "2"] })).toBe("failed");
  });
  it("wrong derivative", () => {
    expect(v({ type: "derivative", function: "3*x^3 - 5*x^2 + 2*x", variable: "x", result: "9*x^2 - 10*x + 5" })).toBe("failed");
  });
  it("wrong simplify", () => {
    expect(v({ type: "simplify", original: "(x^2-9)/(x-3)", result: "x-3", variable: "x" })).toBe("failed");
  });
  it("wrong numeric", () => {
    expect(v({ type: "numeric", expression: "log(32,2)", value: "6" })).toBe("failed");
  });
});

describe("deterministic verifier — refuses to over-claim", () => {
  it("no check type", () => {
    expect(v({ type: "none" })).toBe("unverifiable");
  });
  it("garbage expression", () => {
    expect(v({ type: "equation_roots", expr: "@@@", variable: "x", roots: ["1"] })).toBe("unverifiable");
  });
  it("missing roots", () => {
    expect(v({ type: "equation_roots", expr: "x^2-1", variable: "x", roots: [] })).toBe("unverifiable");
  });
  it("null check", () => {
    expect(runCheck(null).status).toBe("unverifiable");
  });
});
