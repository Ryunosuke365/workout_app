const mysql = require("mysql2/promise");

// 環境変数の取り出し
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT = 3306,
} = process.env;

// 必須項目のチェック
[DB_HOST, DB_USER, DB_PASSWORD, DB_NAME].forEach((v, i) => {
  if (!v) {
    const varName = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"][i];
    console.error(`環境変数 "${varName}" が設定されていません。`);
    process.exit(1); // 必要な情報がない場合は停止
  }
});

// コネクションプールを作成
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // 同時接続数の上限
  queueLimit: 0,       // キューリミットを設定しない
});

// 起動時に接続テストを実施
(async () => {
  try {
    // 実際にコネクションを取得してみる
    const conn = await pool.getConnection();
    conn.release();
    console.log("データベース接続に成功しました。");
  } catch (err) {
    console.error("データベース接続に失敗しました:", err.message);
    process.exit(1);
  }
})();

// 終了時にコネクションをクローズする関数
const gracefulShutdown = async () => {
  try {
    console.log("データベース接続をクローズします...");
    await pool.end();
    console.log("すべてのデータベース接続がクローズされました。");
    process.exit(0);
  } catch (err) {
    console.error("データベース接続クローズ時にエラーが発生しました:", err.message);
    process.exit(1);
  }
};

// SIGINT, SIGTERM でクリーンな終了を試みる
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// モジュールとしてエクスポート
module.exports = pool;
