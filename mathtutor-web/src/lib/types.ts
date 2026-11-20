import type { MathCheck } from "@/lib/math/verify";

export type Level = "3" | "4" | "5";

export interface Topic {
  id: string;
  name: string;
  diff: 1 | 2 | 3;
  desc: string;
  subs: string[];
}

export type Evaluation = "correct" | "partial" | "incorrect" | "alt_method" | "uncertain" | "none";
export type Verdict = "correct" | "partial" | "incorrect" | "unverified";

export interface SolveStep {
  title: string;
  latex: string;
  text: string;
  detail: string;
  say: string;
}
export interface SolveResult {
  problem: string;
  topic: string;
  steps: SolveStep[];
  answer: string;
  answerLatex: string;
  check: MathCheck | null;
}

export interface GeneratedQuestion {
  question: string;
  answerText: string;
  check: MathCheck | null;
}

export interface AnswerEvaluation {
  evaluation: Evaluation;
  feedback: string;
  say: string;
  check: MathCheck | null;
}

export interface TutorTurn {
  text: string;
  voice: string;
  evaluation: Evaluation;
  check: MathCheck | null;
  phase: "asking" | "done";
}

export interface RecognizedImage {
  problem: string;
  language: "he" | "en";
  hasMath: boolean;
}
