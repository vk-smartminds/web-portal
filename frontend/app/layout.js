import Script from 'next/script';

import './globals.css'
import Header from '../components/Header.jsx'
import ScreenTimeTracker from '../components/ScreenTimeTracker';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <ScreenTimeTracker />
        {children}
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
      </body>
    </html>
  );
}