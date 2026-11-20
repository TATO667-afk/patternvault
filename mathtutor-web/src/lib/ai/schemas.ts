import { z } from "zod";

/** Strict structured-output validation for every AI response. If the model
 *  returns something off-shape, the route rejects it rather than passing
 *  unvalidated data to the UI or the verifier. */

export const MathCheckSchema = z
  .object({
    type: z.enum(["equation_roots", "derivative", "integral", "simplify", "numeric", "none"]),
    expr: z.string().optional(),
    variable: z.string().optional(),
    roots: z.array(z.string()).optional(),
    function: z.string().optional(),
    integrand: z.string().optional(),
    result: z.string().optional(),
    original: z.string().optional(),
    expression: z.string().optional(),
    value: z.union([z.string(), z.number()]).optional(),
  })
  .nullable();

export const SolveSchema = z.object({
  problem: z.string().default(""),
  topic: z.string().default(""),
  steps: z
    .array(
      z.object({
        title: z.string().default(""),
        latex: z.string().default(""),
        text: z.string().default(""),
        detail: z.string().default(""),
        say: z.string().default(""),
      })
    )
    .default([]),
  answer: z.string().default(""),
  answerLatex: z.string().default(""),
  check: MathCheckSchema.default(null),
});

export const GeneratedQuestionSchema = z.object({
  question: z.string(),
  answerText: z.string().default(""),
  check: MathCheckSchema.default(null),
});

export const ExamQuestionsSchema = z.array(GeneratedQuestionSchema).min(1);

const EvaluationEnum = z.enum(["correct", "partial", "incorrect", "alt_method", "uncertain", "none"]);

export const AnswerEvaluationSchema = z.object({
  evaluation: EvaluationEnum.default("uncertain"),
  feedback: z.string().default(""),
  say: z.string().default(""),
  check: MathCheckSchema.default(null),
});

export const ExamEvalItemSchema = z.object({
  index: z.number(),
  evaluation: EvaluationEnum.default("uncertain"),
  check: MathCheckSchema.default(null),
});
export const ExamEvalSchema = z.array(ExamEvalItemSchema);

export const TutorTurnSchema = z.object({
  text: z.string().default(""),
  voice: z.string().default(""),
  evaluation: EvaluationEnum.default("none"),
  check: MathCheckSchema.default(null),
  phase: z.enum(["asking", "done"]).default("asking"),
});

export const RecognizedImageSchema = z.object({
  problem: z.string().default(""),
  language: z.enum(["he", "en"]).default("he"),
  hasMath: z.boolean().default(false),
});

export const HintSchema = z.object({
  hint: z.string(),
  say: z.string().default(""),
});
