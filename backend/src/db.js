const mysql = require("mysql2/promise");

// 環境変数からデータベース接続情報を取得
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT = 3306, // ポートが指定されていない場合はデフォルト3306を使用
} = process.env;

// 必須の環境変数が設定されているかチェック
[DB_HOST, DB_USER, DB_PASSWORD, DB_NAME].forEach((v, i) => {
  if (!v) {
    const varName = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"][i];
    process.exit(1); // 設定漏れがあれば即終了
  }
});

// コネクションプールを作成
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true, // 接続待機を有効にする
  connectionLimit: 10,       // 同時接続数の上限
  queueLimit: 0,             // 待機キューに制限なし
});

// 起動時にDB接続チェックを実施
(async () => {
  try {
    const conn = await pool.getConnection();
    conn.release(); // 接続テスト後にすぐリリース
  } catch (err) {
    process.exit(1);
  }
})();

// サーバー終了時にDBコネクションをクリーンに閉じる処理
const gracefulShutdown = async () => {
  try {
    await pool.end();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
};

// プロセス終了シグナルを受けたらクリーンアップを実行
process.on("SIGINT", gracefulShutdown);  // Ctrl+C
process.on("SIGTERM", gracefulShutdown); // プロセス終了要求

module.exports = pool;
