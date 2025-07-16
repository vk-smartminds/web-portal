import '../styles/globals.css';
import Script from 'next/script';
import ScreenTimeTracker from '../../components/ScreenTimeTracker';

export default function App({ Component, pageProps }) {
  return (
    <>
      <ScreenTimeTracker />
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
      <Component {...pageProps} />
    </>
  );
}
