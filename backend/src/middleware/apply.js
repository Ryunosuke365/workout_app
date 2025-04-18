const express = require("express");
const cors = require("cors");

// 本番環境では特定のドメインのみ許可
const allowedOrigin = "https;//loadlog.jp";

//アプリに必要なミドルウェアを適用する関数
const applyMiddlewares = (app) => {
  // JSONボディをパースするミドルウェア
  app.use(express.json());

  // CORS設定（指定のドメインのみ許可）
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
    })
  );
};

module.exports = { applyMiddlewares };
