const express = require("express");
const app = express();

// ✅ ミドルウェアの読み込み
const { applyMiddlewares } = require("./middleware/apply");
const { authenticateToken } = require("./middleware/auth");

// ✅ ルートの読み込み
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const measureRoute = require("./routes/measure");
const historyRoutes = require("./routes/history");
const settingRoutes = require("./routes/setting");

// ✅ 共通ミドルウェアの適用（CORS, JSONパースなど）
applyMiddlewares(app);

// ✅ 各ルートの登録
app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/measure", authenticateToken, measureRoute);
app.use("/api/history", authenticateToken, historyRoutes);
app.use("/api/setting", authenticateToken, settingRoutes);

// ⚠️ 404 Not Found（ルートが一致しなかった場合）
app.use((req, res, next) => {
  console.warn(`⚠️ 404 - 該当するルートがありません: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "⚠️ ページが見つかりません。" });
});

// ❌ サーバーエラー時の共通ハンドリング
app.use((err, req, res, next) => {
  console.error("🚨 サーバーエラー:", err.stack || err);
  res.status(500).json({ error: "❌ サーバーエラーが発生しました。" });
});

module.exports = app;
