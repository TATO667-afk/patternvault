import type { Level, Topic } from "@/lib/types";

/**
 * PROVISIONAL curriculum mapping — NOT an official Ministry of Education syllabus.
 * Based on the well-known questionnaire structure (3 u: 35182/35381/35382,
 * 4 u: 35481/35482, 5 u: 35581/35582). Verify against official מפמ"ר sources
 * before any commercial use.
 */
export const CURRICULUM: Record<Level, Topic[]> = {
  "3": [
    { id: "L3-algebra", name: "אלגברה ומשוואות", diff: 1, desc: "כלי היסוד לכל שאלה.", subs: ["משוואות ליניאריות", "משוואות ריבועיות", "מערכת משוואות"] },
    { id: "L3-word", name: "בעיות מילוליות", diff: 2, desc: "תרגום סיפור למשוואה ופתרונו.", subs: ["תנועה", "הספק/עבודה", "קנייה ומכירה", "גיל"] },
    { id: "L3-func", name: "פונקציות", diff: 2, desc: "קווית ופרבולה.", subs: ["הישר y=mx+n", "פרבולה", "נקודות חיתוך"] },
    { id: "L3-calc", name: "חשבון דיפרנציאלי", diff: 2, desc: "נגזרת של פולינום וחקירה בסיסית.", subs: ["נגזרת של פולינום", "נקודות קיצון", "עלייה וירידה"] },
    { id: "L3-growth", name: "אחוזים, ריבית וגדילה", diff: 1, desc: "חישובים יישומיים.", subs: ["אחוזים", "ריבית דריבית", "גדילה ודעיכה"] },
    { id: "L3-seq", name: "סדרות", diff: 2, desc: "חשבונית והנדסית.", subs: ["סדרה חשבונית", "סדרה הנדסית", "סכום סדרה"] },
    { id: "L3-prob", name: "סטטיסטיקה והסתברות", diff: 1, desc: "יסודות.", subs: ["ממוצע ושכיח", "הסתברות בסיסית", "דיאגרמות"] },
  ],
  "4": [
    { id: "L4-algfunc", name: "אלגברה ופונקציות", diff: 2, desc: "פונקציות מתקדמות וביטויים.", subs: ["פונקציה רציונלית", "שורש ריבועי", "אי-שוויונות"] },
    { id: "L4-calc", name: "חשבון דיפרנציאלי ואינטגרלי", diff: 3, desc: "נגזרת ואינטגרל.", subs: ["חקירת פונקציה", "אינטגרל מסוים", "שטחים"] },
    { id: "L4-trig", name: "טריגונומטריה במישור", diff: 3, desc: "משולשים וזהויות.", subs: ["סינוס וקוסינוס", "משפט הסינוסים/קוסינוסים", "זהויות"] },
    { id: "L4-geoan", name: "גאומטריה אנליטית", diff: 3, desc: "הישר והמעגל במערכת צירים.", subs: ["משוואת הישר", "משוואת המעגל", "משיקים"] },
    { id: "L4-prob", name: "הסתברות", diff: 2, desc: "דיאגרמות עץ ומותנה.", subs: ["עץ הסתברות", "הסתברות מותנית", "התפלגות בינומית"] },
    { id: "L4-word", name: "בעיות מילוליות מתקדמות", diff: 3, desc: "כולל קיצון ונגזרות.", subs: ["בעיות קיצון", "תנועה מתקדם", "תערובות"] },
    { id: "L4-seq", name: "סדרות", diff: 2, desc: "כולל טור הנדסי אינסופי.", subs: ["חשבונית", "הנדסית", "טור אינסופי"] },
  ],
  "5": [
    { id: "L5-calc", name: "חשבון דיפרנציאלי ואינטגרלי", diff: 3, desc: "רציונלית, שורש, טריגו, מעריכית.", subs: ["חקירה מלאה", "אינטגרלים", "קצב השתנות"] },
    { id: "L5-trig", name: "טריגונומטריה", diff: 3, desc: "זהויות, משוואות ובמרחב.", subs: ["זהויות", "משוואות טריגו", "טריגו במרחב"] },
    { id: "L5-geoan", name: "גאומטריה אנליטית ווקטורים", diff: 3, desc: "ישר, מעגל ווקטורים.", subs: ["מעגל ומשיקים", "וקטורים", "מכפלה סקלרית"] },
    { id: "L5-complex", name: "מספרים מרוכבים", diff: 3, desc: "פעולות וצורה קוטבית.", subs: ["פעולות", "מישור גאוס", "צורה קוטבית"] },
    { id: "L5-prob", name: "הסתברות וקומבינטוריקה", diff: 2, desc: "ספירה והתפלגויות.", subs: ["קומבינטוריקה", "בינומית", "מותנית"] },
    { id: "L5-explog", name: "מעריכית ולוגריתמית", diff: 2, desc: "פונקציות וצמיחה.", subs: ["חוקי לוגריתמים", "משוואות מעריכיות", "חקירת e^x ו-ln"] },
  ],
};

export function topicsForLevel(level: Level): Topic[] {
  return CURRICULUM[level] || [];
}
export function findTopic(level: Level, id: string): Topic | null {
  return (CURRICULUM[level] || []).find((t) => t.id === id) || null;
}
export function anyTopic(id: string): Topic | null {
  for (const lvl of ["3", "4", "5"] as Level[]) {
    const t = findTopic(lvl, id);
    if (t) return t;
  }
  return null;
}
export function diffWord(d: number): string {
  return d >= 3 ? "מתקדם" : d === 2 ? "בינוני" : "קל";
}
