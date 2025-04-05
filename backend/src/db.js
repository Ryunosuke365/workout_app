const mysql = require("mysql2/promise"); // ← ここが超重要！

// ✅ 環境変数の存在チェック
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`🚨 環境変数 ${envVar} が設定されていません。`);
    process.exit(1);
  }
}

// ✅ プール作成
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

// ✅ 起動時に一度だけ接続確認（エラーならプロセス終了）
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ データベース接続に成功しました。");
    conn.release(); // ← この行でエラーが出ないようになる！
  } catch (err) {
    console.error("❌ データベース接続に失敗しました:", err.message);
    process.exit(1);
  }
})();

// ✅ プールをエクスポート（Promise対応）
module.exports = pool;
