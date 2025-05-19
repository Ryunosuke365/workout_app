const db = require("../db");

// データベースクエリを実行するヘルパー関数
const query = (sql, params) => db.execute(sql, params);
// リクエストからユーザーIDを抽出するヘルパー関数
const extractUserId = (req) => req.user.user_id;



// 利用可能な日付（運動記録が存在する日付）のリストを取得します。
exports.getAvailableDates = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    // ユーザーの運動記録から重複なく日付を取得し、降順でソート
    const [rows] = await query(
      `SELECT DISTINCT DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') AS date
         FROM exercise_records
        WHERE user_id = ?
        ORDER BY date DESC`,
      [user_id]
    );

    // 取得した日付の配列をJSON形式で返す
    res.json({ dates: rows.map((row) => row.date) });
  } catch (error) {
    res.status(500).json({ error: "利用可能な日付の取得に失敗しました。" });
  }
};



// 指定された日付の運動履歴を取得します。
exports.getDailyHistory = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { date } = req.query; // クエリパラメータから日付を取得

    // 指定されたユーザーIDと日付に一致する運動記録と関連する運動種目情報を取得
    const [rows] = await query(
      `SELECT e.category, e.name, r.weight, r.reps, r.total_load
         FROM exercise_records r
         JOIN exercises e ON r.exercise_id = e.id
        WHERE r.user_id = ?
          AND DATE(r.recorded_at) = ?`,
      [user_id, date]
    );

    // 取得した日次履歴をJSON形式で返す
    res.json({ dailyHistory: rows });
  } catch (error) {
    res.status(500).json({ error: "データの取得に失敗しました。" });
  }
};



// カテゴリ別の総負荷量と全体の総負荷量を取得します。
exports.getTotalLoad = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    // カテゴリごとの総負荷量を計算
    const [categoryTotals] = await query(
      `SELECT e.category, SUM(r.total_load) AS total_load
         FROM exercise_records r
         JOIN exercises e ON r.exercise_id = e.id
        WHERE r.user_id = ?
        GROUP BY e.category`,
      [user_id]
    );

    // 全体の総負荷量を計算 (COALESCEを使用して記録がない場合に0を返す)
    const [overall] = await query(
      `SELECT COALESCE(SUM(total_load), 0) AS total_load
         FROM exercise_records
        WHERE user_id = ?`,
      [user_id]
    );

    // カテゴリ別総負荷量と全体総負荷量をJSON形式で返す
    res.json({
      categoryTotals,
      overallTotal: overall[0].total_load,
    });
  } catch (error) {
    res.status(500).json({ error: "総負荷の取得に失敗しました。" });
  }
};



// 週ごとの運動データを取得します。
exports.getWeeklyData = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    // 週ごと、カテゴリごとの総負荷量を取得
    const [data] = await query(
      `SELECT 
        CONCAT(YEAR(recorded_at),  -- 年と週番号を結合して週を識別
               LPAD(WEEK(recorded_at, 1), 2, '0') -- 週番号を2桁にフォーマット (モード1: 月曜始まり)
        ) AS week,
        e.category,
        SUM(r.total_load) AS total_load
       FROM exercise_records r
       JOIN exercises e ON r.exercise_id = e.id
       WHERE r.user_id = ?
       GROUP BY week, e.category
       ORDER BY week ASC`, // 週で昇順ソート
      [user_id]
    );

    // 全カテゴリのリストを作成
    const categories = [...new Set(data.map(d => d.category))];
    const combined = {}; // 週ごとのデータを格納するオブジェクト

    // 取得したデータを週ごとに集計し、カテゴリごとの負荷量を整形
    data.forEach(({ week, category, total_load }) => {
      if (!combined[week]) {
        combined[week] = { week, total_load: 0 };
        // 各週のオブジェクトに全カテゴリのキーを初期値0で設定
        categories.forEach(c => combined[week][c] = 0);
      }
      combined[week][category] = total_load;
      combined[week].total_load += total_load;
    });

    // 整形された週ごとのデータをJSON形式で返す
    res.json({ weeklyData: Object.values(combined) });
  } catch (error) {
    res.status(500).json({ error: "週ごとのデータ取得に失敗しました。" });
  }
};