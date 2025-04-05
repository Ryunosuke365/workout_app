const mysql = require("mysql2");

// 必須の環境変数の存在チェック
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`🚨 環境変数 ${envVar} が設定されていません。`);
    process.exit(1);
  }
}

// データベース接続プールの作成
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 接続確認（開発 or 起動チェック用。不要ならコメントアウト可）
pool.getConnection()
  .then(conn => {
    console.log("✅ データベース接続に成功しました。");
    conn.release();
  })
  .catch(err => {
    console.error("❌ データベース接続に失敗しました:", err);
    process.exit(1);
  });

// プール（Promiseベース）をエクスポート
module.exports = pool.promise();
