const express = require("express");
const cors = require("cors");

// 許可するオリジン（CORS対策用）
const allowedOrigin = "https;//loadlog.jp";

// アプリケーションに共通ミドルウェアを適用する関数
const applyMiddlewares = (app) => {
  // リクエストボディをJSONとしてパース
  app.use(express.json());

  // CORS設定：指定オリジンからのリクエストのみ許可
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true, // クッキーなどの認証情報も許可
    })
  );
};

module.exports = { applyMiddlewares };
