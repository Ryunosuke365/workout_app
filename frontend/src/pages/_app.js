// pages/_app.js
import "@/styles/globals.css";  // 統一したグローバルCSSだけ読み込む

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
