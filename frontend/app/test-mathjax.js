import Script from 'next/script';
import { useEffect, useRef } from 'react';

export default function TestMathJax() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.MathJax && ref.current) {
      window.MathJax.typesetPromise([ref.current]);
    }
  }, []);

  return (
    <>
      <Script id="mathjax-config" strategy="beforeInteractive">
        {`
          window.MathJax = {
            tex: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
            },
            svg: { fontCache: 'global' },
          };
        `}
      </Script>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.min.js"
        strategy="afterInteractive"
      />
      <div ref={ref} style={{ fontSize: 24, margin: 40 }}>
        Here is some math: $E=mc^2$
      </div>
    </>
  );
} 