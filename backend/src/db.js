const mysql = require("mysql2");

// ✅ ログ出力：環境変数の確認（念のため）
console.log("📦 DB接続チェック：", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

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
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 接続確認（起動時にDBへ接続できるか確認）
pool.getConnection()
  .then(conn => {
    console.log("✅ データベース接続に成功しました。");
    conn.release();
  })
  .catch(err => {
    console.error("❌ データベース接続に失敗しました:", err.message);
    process.exit(1);
  });

// エクスポート：promiseベースで扱いやすくする
module.exports = pool.promise();
