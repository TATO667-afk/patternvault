/*
 * Deterministic math verification engine.
 * Runs identically in the browser (global `math` from math.js CDN) and in Node
 * (require('mathjs')). It NEVER claims a result is verified unless it has
 * independently checked it numerically with the CAS. Three outcomes only:
 *   verified      – the engine confirmed the answer
 *   failed        – the engine actively contradicts the answer (likely AI error)
 *   unverifiable  – the engine could not check it (don't claim anything)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory;          // Node: module.exports = makeVerifier
  } else {
    root.makeVerifier = factory;       // Browser: window.makeVerifier(math)
  }
})(typeof self !== "undefined" ? self : this, function makeVerifier(math) {
  var SAMPLE_XS = [-3.73, -2.11, -0.92, 0.37, 1.44, 2.69, 3.91, 5.23, 6.57];
  var REL_TOL = 1e-6;   // relative tolerance for function comparisons
  var ABS_TOL = 1e-5;   // absolute tolerance for "equals zero" checks

  function V(status, message) { return { status: status, message: message }; }
  var UNVERIFIABLE = function (m) { return V("unverifiable", m || "לא ניתן לאמת אוטומטית"); };
  var FAILED = function (m) { return V("failed", m); };
  var VERIFIED = function (m) { return V("verified", m); };

  // Evaluate an expression to a finite magnitude (handles real + complex), or null.
  function magnitude(expr, scope) {
    try {
      var r = math.evaluate(expr, scope || {});
      var a = math.abs(r);
      var n = typeof a === "number" ? a : Number(a);
      return isFinite(n) ? n : null;
    } catch (e) { return null; }
  }

  // Evaluate to a plain finite real number, or null.
  function num(expr, scope) {
    try {
      var r = math.evaluate(expr, scope || {});
      if (typeof r === "number" && isFinite(r)) return r;
      return null;
    } catch (e) { return null; }
  }

  // Evaluate a root string to a value object (may be real or complex), or undefined.
  function valueOf(expr) {
    try { return math.evaluate(String(expr)); } catch (e) { return undefined; }
  }

  // --- 1. Equation roots: substitute each root into `expr` (which equals 0) ---
  function verifyRoots(c) {
    var expr = c.expr, variable = c.variable || "x", roots = c.roots;
    if (!expr || String(expr).indexOf("=") !== -1) return UNVERIFIABLE("ביטוי לא תקין לאימות");
    if (!Array.isArray(roots) || !roots.length) return UNVERIFIABLE("לא סופקו פתרונות לבדיקה");
    var checked = 0;
    for (var i = 0; i < roots.length; i++) {
      var rv = valueOf(roots[i]);
      if (rv === undefined) return UNVERIFIABLE("פתרון לא מספרי: " + roots[i]);
      var scope = {}; scope[variable] = rv;
      var m = magnitude(expr, scope);
      if (m === null) return UNVERIFIABLE("הצבה נכשלה");
      if (m > ABS_TOL) return FAILED("הצבת " + roots[i] + " נתנה " + m.toExponential(2) + " במקום 0 — ייתכן שנפלה טעות");
      checked++;
    }
    return VERIFIED("כל " + checked + " הפתרונות הוצבו במשוואה ונתנו 0 ✓");
  }

  // Compare two expressions numerically over sample points. Returns verified/failed/unverifiable.
  function compareExpr(a, b, variable, okMsg) {
    variable = variable || "x";
    var valid = 0;
    for (var i = 0; i < SAMPLE_XS.length; i++) {
      var scope = {}; scope[variable] = SAMPLE_XS[i];
      var av = num(a, scope), bv = num(b, scope);
      if (av === null || bv === null) continue;           // skip singularities / undefined points
      valid++;
      var diff = Math.abs(av - bv);
      var scale = 1 + Math.max(Math.abs(av), Math.abs(bv));
      if (diff > REL_TOL * scale) {
        return FAILED("הביטויים נבדלים בנקודה " + variable + "=" + SAMPLE_XS[i] +
          " (" + av.toPrecision(5) + " מול " + bv.toPrecision(5) + ") — ייתכן שנפלה טעות");
      }
    }
    if (valid < 3) return UNVERIFIABLE("אין מספיק נקודות להשוואה מהימנה");
    return VERIFIED(okMsg + " (נבדק ב-" + valid + " נקודות) ✓");
  }

  // --- 2. Derivative: engine differentiates independently and compares ---
  function verifyDerivative(c) {
    var fn = c.function, variable = c.variable || "x", result = c.result;
    if (!fn || !result) return UNVERIFIABLE("חסר ביטוי לבדיקת נגזרת");
    var d;
    try { d = math.derivative(fn, variable).toString(); }
    catch (e) { return UNVERIFIABLE("לא ניתן לגזור אוטומטית"); }
    return compareExpr(d, result, variable, "הנגזרת שחושבה עצמאית תואמת לתוצאה");
  }

  // --- 3. Indefinite integral: differentiate the result, compare to integrand ---
  function verifyIntegral(c) {
    var integrand = c.integrand, variable = c.variable || "x", result = c.result;
    if (!integrand || !result) return UNVERIFIABLE("חסר ביטוי לבדיקת אינטגרל");
    var cleaned = String(result).replace(/\+\s*C\b/i, "");   // drop integration constant
    var d;
    try { d = math.derivative(cleaned, variable).toString(); }
    catch (e) { return UNVERIFIABLE("לא ניתן לגזור את התוצאה"); }
    return compareExpr(d, integrand, variable, "נגזרת התוצאה תואמת לפונקציה שתחת האינטגרל");
  }

  // --- 4. Simplify / identity: two expressions must be equal everywhere ---
  function verifySimplify(c) {
    var original = c.original, result = c.result, variable = c.variable || "x";
    if (!original || !result) return UNVERIFIABLE("חסר ביטוי לבדיקת פישוט");
    return compareExpr(original, result, variable, "הביטוי המפושט שקול למקורי");
  }

  // --- 5. Pure numeric evaluation (e.g. log2(32)=5, area=24) ---
  function verifyNumeric(c) {
    var expression = c.expression, value = c.value;
    if (expression == null || value == null) return UNVERIFIABLE("חסר ערך לבדיקה");
    var got = num(expression), want = num(String(value));
    if (got === null || want === null) return UNVERIFIABLE("לא ניתן לחשב מספרית");
    if (Math.abs(got - want) <= ABS_TOL + REL_TOL * (1 + Math.abs(want))) {
      return VERIFIED("החישוב אומת: " + expression + " = " + want + " ✓");
    }
    return FAILED("החישוב נתן " + got + " במקום " + want + " — ייתכן שנפלה טעות");
  }

  function run(check) {
    if (!check || typeof check !== "object") return UNVERIFIABLE();
    try {
      switch (check.type) {
        case "equation_roots": return verifyRoots(check);
        case "derivative":     return verifyDerivative(check);
        case "integral":       return verifyIntegral(check);
        case "simplify":       return verifySimplify(check);
        case "numeric":        return verifyNumeric(check);
        case "none":
        default:               return UNVERIFIABLE();
      }
    } catch (e) {
      return UNVERIFIABLE("שגיאה באימות");
    }
  }

  return { run: run };
});
