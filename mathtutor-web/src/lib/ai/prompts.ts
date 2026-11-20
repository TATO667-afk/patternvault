import type { Level } from "@/lib/types";

/** Shared math.js-syntax check spec (same engine as Phase 2–4). */
export const CHECK_SPEC =
  "אובייקט check לאימות דטרמיניסטי בתחביר math.js (ASCII בלבד: ^ לחזקה, * לכפל מפורש, sqrt(), log(x,base), sin, cos, pi, e, i), בלי הסימן =:\n" +
  '• משוואה: {"type":"equation_roots","expr":"<ביטוי ששווה אפס>","variable":"x","roots":["..."]}\n' +
  '• נגזרת: {"type":"derivative","function":"<f>","variable":"x","result":"<f\'>"}\n' +
  '• אינטגרל: {"type":"integral","integrand":"<f>","variable":"x","result":"<F>"}\n' +
  '• שקילות/פישוט: {"type":"simplify","original":"<a>","result":"<b>","variable":"x"}\n' +
  '• חישוב מספרי: {"type":"numeric","expression":"<ביטוי>","value":"<מספר>"}\n' +
  '• אם לא ניתן לאמת: {"type":"none"} או null. אל תמציא check שאינו נכון מתמטית.\n';

const LEVEL_WORD: Record<Level, string> = { "3": "3 יחידות", "4": "4 יחידות", "5": "5 יחידות" };

export function solvePrompt(problem: string): string {
  return (
    "אתה מורה פרטי מצוין למתמטיקה ברמת בגרות בישראל. קיבלת מתלמיד את הבעיה הבאה:\n\n" +
    '"""\n' + problem + '\n"""\n\n' +
    "פתור אותה והסבר בעברית פשוטה וברורה, שלב אחר שלב, כמו מורה סבלני. בכל שלב הסבר גם *למה* עושים את הפעולה. ודא שהחישובים נכונים.\n\n" +
    "לכל שלב ספק: title (כותרת קצרה), latex (הביטוי המרכזי ב-LaTeX בלי $), text (הסבר כתוב), detail (הרחבה), say (נוסח מדובר עם מספרים במילים, בלי סימנים כמו ^ √ =).\n\n" +
    "בנוסף ספק check לאימות התשובה הסופית.\n" + CHECK_SPEC +
    "\nהחזר אך ורק JSON תקין:\n" +
    '{ "problem":"ניסוח מסודר", "topic":"הנושא", "steps":[{"title":"","latex":"","text":"","detail":"","say":""}], "answer":"התשובה במילים", "answerLatex":"", "check": {} }'
  );
}

export function generateQuestionPrompt(level: Level, topicName: string, subs: string[], diffWord: string): string {
  return (
    "צור שאלת תרגול מקורית אחת במתמטיקה לרמת " + LEVEL_WORD[level] + ", בנושא: " + topicName +
    " (" + subs.join(", ") + "). רמת קושי: " + diffWord + ".\n" +
    "השאלה בעברית, ברורה ובסגנון בגרות, אך מקורית לתרגול — לא העתק של בחינה רשמית. אל תכלול את הפתרון.\n" +
    "נוסחאות בתוך הטקסט ב-\\( \\) או $$ $$.\n" + CHECK_SPEC +
    'החזר JSON בלבד: { "question":"נוסח השאלה", "answerText":"התשובה הסופית במילים", "check": {} }'
  );
}

export function examQuestionsPrompt(level: Level, count: number): string {
  return (
    "צור " + count + " שאלות תרגול מקוריות ומגוונות במתמטיקה לרמת " + LEVEL_WORD[level] +
    ", בסגנון בגרות אך מקוריות (לא העתק של בחינה רשמית). גוון בין הנושאים. לכל שאלה ספק גם check לאימות התשובה.\n" +
    CHECK_SPEC +
    'החזר JSON array בלבד באורך ' + count + ': [{ "question":"...", "answerText":"...", "check": {} }]'
  );
}

export function evaluateAnswerPrompt(question: string, studentAnswer: string): string {
  return (
    "הנה שאלת תרגול ותשובת תלמיד. הערך בהוגנת (קבל כל דרך מתמטית תקינה).\n" +
    "שאלה: " + question + "\nתשובת התלמיד: " + studentAnswer + "\n" +
    'החזר JSON בלבד: { "evaluation":"correct|partial|incorrect|alt_method|uncertain", "feedback":"משוב קצר ומעודד בעברית", "say":"אותו משוב בנוסח מדובר", "check": {} }\n' +
    CHECK_SPEC
  );
}

export function examEvalPrompt(items: { question: string; answer: string }[]): string {
  const lines = items
    .map((it, i) => "שאלה " + (i + 1) + ": " + it.question + "\nתשובת התלמיד: " + (it.answer.trim() || "(לא נענתה)"))
    .join("\n\n");
  return (
    "הערך את תשובות התלמיד לכל השאלות. לכל שאלה החזר אובייקט עם: index (0-based), evaluation (correct|partial|incorrect|alt_method|uncertain), ו-check (לבדיקת תשובת התלמיד, או null).\n" +
    CHECK_SPEC +
    "החזר JSON array בלבד.\n\n" + lines
  );
}

export function hintPrompt(question: string, level: 1 | 2 | 3): string {
  const instr =
    level === 1
      ? "תן רמז עדין מאוד — כיוון מחשבה כללי בלבד, בלי לפתור."
      : level === 2
      ? "תן רמז ממוקד — הצבע על הצעד הבא, בלי לבצע אותו עד הסוף."
      : "תן הכוונה מפורטת לצעד הראשון בפתרון, בלי לחשוף את התשובה הסופית.";
  return instr + "\n\nהשאלה: " + question + '\n\nהחזר JSON בלבד: { "hint":"הרמז בעברית", "say":"אותו רמז בנוסח מדובר" }';
}

export function recognizePrompt(): string {
  return (
    "הסתכל בתמונה המצורפת וחלץ ממנה את שאלת המתמטיקה כפי שהיא כתובה, בעברית או באנגלית, כולל כל הנתונים והסימנים. " +
    "שמור על נוסח נאמן למקור ואל תפתור. " +
    'החזר אך ורק JSON: {"problem":"השאלה המלאה","language":"he או en","hasMath":true או false}. ' +
    "אם אין בתמונה שאלת מתמטיקה, החזר hasMath=false ו-problem ריק."
  );
}

/** Leading instruction turn for the Socratic guided tutor (same contract as Phase 3). */
export function tutorInstruction(problem: string, explainLevel: "simple" | "regular" | "advanced"): string {
  const lvl =
    explainLevel === "simple"
      ? "הסבר פשוט מאוד, מילים יומיומיות ודוגמאות קונקרטיות, בלי ז'רגון."
      : explainLevel === "advanced"
      ? "הסבר מתקדם ותמציתי, מותר מונחים פורמליים וקיצורי דרך, לתלמיד חזק."
      : "הסבר רגיל, ברור ומסודר, לתלמיד תיכון ממוצע.";
  return (
    "אתה מורה פרטי ישראלי — סבלני, חם ומעודד — למתמטיקה ברמת בגרות. אתה מלמד ב\"מצב לימוד מודרך\" בשיטה סוקרטית.\n" +
    "כללי הוראה:\n" +
    "• המטרה שהתלמיד יבין ויפתור בעצמו — לא לפתור במקומו.\n" +
    "• אל תחשוף את התשובה הסופית או את כל הפתרון מראש. התקדם צעד אחר צעד.\n" +
    "• בכל תור שאל שאלה אחת בלבד, קצרה וממוקדת.\n" +
    "• הערך את תשובת התלמיד וקבל כל דרך מתמטית תקינה.\n" +
    "• כשהתלמיד טועה: זהה את הפעולה השגויה, הסבר למה, תן רמז, ובקש ניסיון נוסף — בלי להתחיל מחדש.\n" +
    "• עברית טבעית. " + lvl + "\n" +
    "• נוסחאות: \\( ... \\) בשורה, או $$ ... $$ מודגש. בלי דולר בודד.\n\n" +
    "אימות: כשתשובת התלמיד ניתנת לבדיקה, החזר גם check לבדיקת נכונות התשובה של התלמיד.\n" + CHECK_SPEC +
    "\nהחזר בכל תור אך ורק JSON תקין:\n" +
    '{ "text":"הודעה לתלמיד — משוב (אם רלוונטי) ואז שאלה אחת", "voice":"אותה הודעה בנוסח מדובר", "evaluation":"none|correct|partial|incorrect|alt_method|uncertain", "check": null, "phase":"asking|done" }\n' +
    'בתור הפתיחה: evaluation="none", check=null, phase="asking".\n\n' +
    'הבעיה של התלמיד:\n"""\n' + problem + '\n"""\n'
  );
}
