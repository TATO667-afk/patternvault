/**
 * Deterministic math verification engine (ported unchanged in behaviour from the
 * Phase 1–4 artifact `verify.js`, now typed). It independently checks an answer
 * with the math.js CAS and NEVER claims "verified" unless it confirmed the result.
 *
 * Three outcomes only:
 *   "verified"     – the engine confirmed the answer
 *   "failed"       – the engine actively contradicts the answer (likely an AI error)
 *   "unverifiable" – the engine could not check it (never implies the AI is right)
 */
import { create, all, type MathJsInstance } from "mathjs";

const math: MathJsInstance = create(all, {});

export type CheckType =
  | "equation_roots"
  | "derivative"
  | "integral"
  | "simplify"
  | "numeric"
  | "none";

export interface MathCheck {
  type: CheckType;
  // equation_roots
  expr?: string;
  variable?: string;
  roots?: string[];
  // derivative / integral
  function?: string;
  integrand?: string;
  result?: string;
  // simplify
  original?: string;
  // numeric
  expression?: string;
  value?: string | number;
}

export type VerifyStatus = "verified" | "failed" | "unverifiable";
export interface VerifyResult {
  status: VerifyStatus;
  message: string;
}

const SAMPLE_XS = [-3.73, -2.11, -0.92, 0.37, 1.44, 2.69, 3.91, 5.23, 6.57];
const REL_TOL = 1e-6;
const ABS_TOL = 1e-5;

const UNVERIFIABLE = (m?: string): VerifyResult => ({ status: "unverifiable", message: m || "לא ניתן לאמת אוטומטית" });
const FAILED = (m: string): VerifyResult => ({ status: "failed", message: m });
const VERIFIED = (m: string): VerifyResult => ({ status: "verified", message: m });

function magnitude(expr: string, scope: Record<string, unknown>): number | null {
  try {
    const r = math.evaluate(expr, scope);
    const a = math.abs(r as number);
    const n = typeof a === "number" ? a : Number(a);
    return isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function num(expr: string, scope?: Record<string, unknown>): number | null {
  try {
    const r = math.evaluate(expr, scope || {});
    if (typeof r === "number" && isFinite(r)) return r;
    return null;
  } catch {
    return null;
  }
}

function valueOf(expr: string): unknown {
  try {
    return math.evaluate(String(expr));
  } catch {
    return undefined;
  }
}

function verifyRoots(c: MathCheck): VerifyResult {
  const expr = c.expr;
  const variable = c.variable || "x";
  const roots = c.roots;
  if (!expr || String(expr).indexOf("=") !== -1) return UNVERIFIABLE("ביטוי לא תקין לאימות");
  if (!Array.isArray(roots) || !roots.length) return UNVERIFIABLE("לא סופקו פתרונות לבדיקה");
  let checked = 0;
  for (const root of roots) {
    const rv = valueOf(root);
    if (rv === undefined) return UNVERIFIABLE("פתרון לא מספרי: " + root);
    const scope: Record<string, unknown> = {};
    scope[variable] = rv;
    const m = magnitude(expr, scope);
    if (m === null) return UNVERIFIABLE("הצבה נכשלה");
    if (m > ABS_TOL) return FAILED("הצבת " + root + " נתנה " + m.toExponential(2) + " במקום 0 — ייתכן שנפלה טעות");
    checked++;
  }
  return VERIFIED("כל " + checked + " הפתרונות הוצבו במשוואה ונתנו 0 ✓");
}

function compareExpr(a: string, b: string, variable: string, okMsg: string): VerifyResult {
  variable = variable || "x";
  let valid = 0;
  for (const x of SAMPLE_XS) {
    const scope: Record<string, unknown> = {};
    scope[variable] = x;
    const av = num(a, scope);
    const bv = num(b, scope);
    if (av === null || bv === null) continue;
    valid++;
    const diff = Math.abs(av - bv);
    const scale = 1 + Math.max(Math.abs(av), Math.abs(bv));
    if (diff > REL_TOL * scale) {
      return FAILED(
        "הביטויים נבדלים בנקודה " + variable + "=" + x + " (" + av.toPrecision(5) + " מול " + bv.toPrecision(5) + ") — ייתכן שנפלה טעות"
      );
    }
  }
  if (valid < 3) return UNVERIFIABLE("אין מספיק נקודות להשוואה מהימנה");
  return VERIFIED(okMsg + " (נבדק ב-" + valid + " נקודות) ✓");
}

function verifyDerivative(c: MathCheck): VerifyResult {
  const fn = c.function;
  const variable = c.variable || "x";
  const result = c.result;
  if (!fn || !result) return UNVERIFIABLE("חסר ביטוי לבדיקת נגזרת");
  let d: string;
  try {
    d = math.derivative(fn, variable).toString();
  } catch {
    return UNVERIFIABLE("לא ניתן לגזור אוטומטית");
  }
  return compareExpr(d, result, variable, "הנגזרת שחושבה עצמאית תואמת לתוצאה");
}

function verifyIntegral(c: MathCheck): VerifyResult {
  const integrand = c.integrand;
  const variable = c.variable || "x";
  const result = c.result;
  if (!integrand || !result) return UNVERIFIABLE("חסר ביטוי לבדיקת אינטגרל");
  const cleaned = String(result).replace(/\+\s*C\b/i, "");
  let d: string;
  try {
    d = math.derivative(cleaned, variable).toString();
  } catch {
    return UNVERIFIABLE("לא ניתן לגזור את התוצאה");
  }
  return compareExpr(d, integrand, variable, "נגזרת התוצאה תואמת לפונקציה שתחת האינטגרל");
}

function verifySimplify(c: MathCheck): VerifyResult {
  const original = c.original;
  const result = c.result;
  const variable = c.variable || "x";
  if (!original || !result) return UNVERIFIABLE("חסר ביטוי לבדיקת פישוט");
  return compareExpr(original, result, variable, "הביטוי המפושט שקול למקורי");
}

function verifyNumeric(c: MathCheck): VerifyResult {
  const expression = c.expression;
  const value = c.value;
  if (expression == null || value == null) return UNVERIFIABLE("חסר ערך לבדיקה");
  const got = num(expression);
  const want = num(String(value));
  if (got === null || want === null) return UNVERIFIABLE("לא ניתן לחשב מספרית");
  if (Math.abs(got - want) <= ABS_TOL + REL_TOL * (1 + Math.abs(want))) {
    return VERIFIED("החישוב אומת: " + expression + " = " + want + " ✓");
  }
  return FAILED("החישוב נתן " + got + " במקום " + want + " — ייתכן שנפלה טעות");
}

export function runCheck(check: MathCheck | null | undefined): VerifyResult {
  if (!check || typeof check !== "object") return UNVERIFIABLE();
  try {
    switch (check.type) {
      case "equation_roots":
        return verifyRoots(check);
      case "derivative":
        return verifyDerivative(check);
      case "integral":
        return verifyIntegral(check);
      case "simplify":
        return verifySimplify(check);
      case "numeric":
        return verifyNumeric(check);
      default:
        return UNVERIFIABLE();
    }
  } catch {
    return UNVERIFIABLE("שגיאה באימות");
  }
}
