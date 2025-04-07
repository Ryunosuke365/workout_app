const db = require("../db");

// 利用可能な日付リスト取得のメイン処理
exports.getAvailableDates = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // 利用可能な日付を取得
    const [dates] = await db.execute(
      `SELECT DISTINCT DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') AS date
       FROM exercise_records
       WHERE user_id = ?
       ORDER BY date DESC`,
      [user_id]
    );

    // 日付リストを整形
    const dateList = dates.map(row => row.date);

    // 成功時のレスポンス
    return res.json({ dates: dateList });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("日付取得エラー:", error);
    return res.status(500).json({ error: "利用可能な日付の取得に失敗しました。" });
  }
};

// 日ごとの履歴取得のメイン処理
exports.getDailyHistory = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { date } = req.query;

    // 必須項目のチェック
    if (!date) {
      return res.status(400).json({ error: "日付が指定されていません。" });
    }

    // 日ごとの履歴を取得
    const [dailyHistory] = await db.execute(
      `SELECT e.category, e.name AS exercise, r.weight, r.reps, r.total_load
       FROM exercise_records r
       JOIN exercises e ON r.exercise_id = e.id
       WHERE r.user_id = ? AND DATE(r.recorded_at) = ?`,
      [user_id, date]
    );

    // 成功時のレスポンス
    return res.json({ dailyHistory });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("日ごとの履歴取得エラー:", error);
    return res.status(500).json({ error: "データの取得に失敗しました。" });
  }
};

// 部位ごとの総負荷と全体の合計負荷取得のメイン処理
exports.getTotalLoad = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // 部位ごとの総負荷を取得
    const [categoryTotals] = await db.execute(
      `SELECT e.category, SUM(r.total_load) AS total_load
       FROM exercise_records r
       JOIN exercises e ON r.exercise_id = e.id
       WHERE r.user_id = ?
       GROUP BY e.category`,
      [user_id]
    );

    // 全体の合計負荷を取得
    const [overallTotal] = await db.execute(
      `SELECT COALESCE(SUM(total_load), 0) AS total_load
       FROM exercise_records 
       WHERE user_id = ?`,
      [user_id]
    );

    // 成功時のレスポンス
    return res.json({
      categoryTotals,
      overallTotal: overallTotal[0]?.total_load || 0
    });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("総負荷取得エラー:", error);
    return res.status(500).json({ error: "総負荷の取得に失敗しました。" });
  }
};

// 週ごとのデータ取得のメイン処理
exports.getWeeklyData = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // 週ごとの部位別データを取得
    const [weeklyData] = await db.execute(
      `SELECT 
        CONCAT(
          YEAR(DATE_SUB(recorded_at, INTERVAL WEEKDAY(recorded_at) DAY)),
          LPAD(WEEK(DATE_SUB(recorded_at, INTERVAL WEEKDAY(recorded_at) DAY), 3), 2, '0')
        ) AS week,
        e.category,
        SUM(r.total_load) AS total_load
       FROM exercise_records r
       JOIN exercises e ON r.exercise_id = e.id
       WHERE r.user_id = ? 
       GROUP BY week, e.category
       ORDER BY week ASC`,
      [user_id]
    );

    // 週ごとの合計データを取得
    const [totalWeekly] = await db.execute(
      `SELECT 
        CONCAT(
          YEAR(DATE_SUB(recorded_at, INTERVAL WEEKDAY(recorded_at) DAY)),
          LPAD(WEEK(DATE_SUB(recorded_at, INTERVAL WEEKDAY(recorded_at) DAY), 3), 2, '0')
        ) AS week,
        COALESCE(SUM(total_load), 0) AS total_load
       FROM exercise_records 
       WHERE user_id = ?
       GROUP BY week
       ORDER BY week ASC`,
      [user_id]
    );

    // カテゴリ一覧を取得
    const categories = [...new Set(weeklyData.map(d => d.category))];

    // データを結合
    const combinedData = {};
    weeklyData.forEach(({ week, category, total_load }) => {
      if (!combinedData[week]) {
        combinedData[week] = { week, total_load: 0 };
        categories.forEach(cat => combinedData[week][cat] = 0);
      }
      combinedData[week][category] = total_load;
    });

    // 合計データを追加
    totalWeekly.forEach(({ week, total_load }) => {
      if (!combinedData[week]) {
        combinedData[week] = { week, total_load };
        categories.forEach(cat => combinedData[week][cat] = 0);
      } else {
        combinedData[week].total_load = total_load;
      }
    });

    // 成功時のレスポンス
    return res.json({ weeklyData: Object.values(combinedData) });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("週ごとのデータ取得エラー:", error);
    return res.status(500).json({ error: "週ごとのデータ取得に失敗しました。" });
  }
};
  