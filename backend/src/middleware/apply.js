const express = require("express");
const cors = require("cors");

// 許可するオリジン一覧
const allowedOrigins = ["https://loadlog.jp"];

// ミドルウェア適用のメイン処理
const applyMiddlewares = (app) => {
  try {
    // JSONデータの解析を有効化
    app.use(express.json());

    // CORSの設定を適用
    app.use(cors({
      origin: (origin, callback) => {
        // origin が undefined の場合（curl, Postmanなど）も許可
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`🚨 CORSポリシーエラー: ${origin} は許可されていません。`));
        }
      },
      credentials: true, // クッキーやトークンのやり取りを許可
    }));

    console.log("✅ ミドルウェアの適用が完了しました。");
  } catch (error) {
    console.error("🚨 ミドルウェア適用エラー:", error);
    throw error;
  }
};

module.exports = { applyMiddlewares };
