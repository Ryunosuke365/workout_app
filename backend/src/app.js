const express = require("express");
const app = express();

// ミドルウェア適用用の関数と、認証ミドルウェアをインポート
const { applyMiddlewares } = require("./middleware/apply");
const { authenticateToken } = require("./middleware/auth");

// 各種ルートハンドラーをまとめて読み込み
const routes = {
  register: require("./routes/register"),
  login: require("./routes/login"),
  measure: require("./routes/measure"),
  history: require("./routes/history"),
  setting: require("./routes/setting"),
};

// アプリケーション全体に共通ミドルウェアを適用（例: JSONパース, CORS設定など）
applyMiddlewares(app);

// 認証不要なルート（新規登録・ログイン）
app.use("/api/register", routes.register);
app.use("/api/login", routes.login);

// 認証が必要なルート（測定・履歴・設定）
app.use("/api/measure", authenticateToken, routes.measure);
app.use("/api/history", authenticateToken, routes.history);
app.use("/api/setting", authenticateToken, routes.setting);

// ここまで到達したリクエストは存在しないルート → 404エラーを返す
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// サーバー内部エラーをキャッチして500エラーを返す
app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
