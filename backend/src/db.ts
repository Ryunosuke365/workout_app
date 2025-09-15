import mysql, { Pool } from "mysql2/promise";

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
} = process.env;

[DB_HOST, DB_USER, DB_PASSWORD, DB_NAME].forEach(value => {
  if (!value) {
    process.exit(1);
  }
});

const pool: Pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : undefined,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    conn.release();
  } catch {
    process.exit(1);
  }
})();

const gracefulShutdown = async () => {
  try {
    await pool.end();
    process.exit(0);
  } catch {
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default pool;