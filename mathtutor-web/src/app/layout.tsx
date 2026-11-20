import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "מורה מתמטיקה AI",
  description: "הכנה לבגרות במתמטיקה — 3, 4 ו-5 יחידות, עם מורה AI ואימות מתמטי.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;600;700&family=Assistant:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* MathJax SVG (self-contained fonts) for RTL-safe LTR math rendering. */}
        <Script id="mathjax-config" strategy="beforeInteractive">
          {`window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]},svg:{fontCache:'local'},startup:{typeset:false}};`}
        </Script>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.js" strategy="afterInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
