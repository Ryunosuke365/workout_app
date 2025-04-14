const express = require("express");
const app = express();

// ミドルウェアの呼び出し
const { applyMiddlewares } = require("./middleware/apply");
const { authenticateToken } = require("./middleware/auth");

// ルートの読み込み
const routes = {
  register: require("./routes/register"),
  login: require("./routes/login"),
  measure: require("./routes/measure"),
  history: require("./routes/history"),
  setting: require("./routes/setting"),
};

// 共通ミドルウェアを適用
applyMiddlewares(app);

// 各ルートを設定
app.use("/api/register", routes.register);
app.use("/api/login", routes.login);

// トークン認証が必要なルート
app.use("/api/measure", authenticateToken, routes.measure);
app.use("/api/history", authenticateToken, routes.history);
app.use("/api/setting", authenticateToken, routes.setting);

// 404エラー処理
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// サーバー内部エラー処理
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
