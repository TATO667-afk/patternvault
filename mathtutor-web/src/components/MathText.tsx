"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    MathJax?: {
      startup?: { promise?: Promise<unknown> };
      typesetPromise?: (els: Element[]) => Promise<void>;
    };
  }
}

async function ensureMathJax(): Promise<boolean> {
  for (let i = 0; i < 60; i++) {
    const mj = window.MathJax;
    if (mj && mj.startup && mj.startup.promise) {
      try {
        await mj.startup.promise;
        return true;
      } catch {
        return false;
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

/** Renders Hebrew text with embedded \( \) / $$ $$ math via MathJax.
 *  Falls back to plain text if MathJax is unavailable. */
export default function MathText({ children, className, block }: { children: string; className?: string; block?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    const el = ref.current;
    if (!el) return;
    el.textContent = children || "";
    (async () => {
      const ok = await ensureMathJax();
      if (!alive || !ok || !window.MathJax?.typesetPromise) return;
      try {
        await window.MathJax.typesetPromise([el]);
      } catch {
        /* keep plain text */
      }
    })();
    return () => {
      alive = false;
    };
  }, [children]);
  return <div ref={ref} className={(block ? "math-host " : "") + (className || "")} dir={block ? "ltr" : "rtl"} />;
}
