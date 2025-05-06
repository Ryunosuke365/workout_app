const db = require("../db");
const query = (sql, params) => db.execute(sql, params);
const extractUserId = (req) => req.user.user_id;

exports.getAvailableDates = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    const [rows] = await query(
      `SELECT DISTINCT DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') AS date
         FROM exercise_records
        WHERE user_id = ?
        ORDER BY date DESC`,
      [user_id]
    );

    res.json({ dates: rows.map((row) => row.date) });
  } catch (error) {
    res.status(500).json({ error: "利用可能な日付の取得に失敗しました。" });
  }
};

exports.getDailyHistory = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "日付が指定されていません。" });
    }

    const [rows] = await query(
      `SELECT e.category, e.name, r.weight, r.reps, r.total_load
         FROM exercise_records r
         JOIN exercises e ON r.exercise_id = e.id
        WHERE r.user_id = ?
          AND DATE(r.recorded_at) = ?`,
      [user_id, date]
    );

    res.json({ dailyHistory: rows });
  } catch (error) {
    res.status(500).json({ error: "データの取得に失敗しました。" });
  }
};

exports.getTotalLoad = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    const [categoryTotals] = await query(
      `SELECT e.category, SUM(r.total_load) AS total_load
         FROM exercise_records r
         JOIN exercises e ON r.exercise_id = e.id
        WHERE r.user_id = ?
        GROUP BY e.category`,
      [user_id]
    );

    const [overall] = await query(
      `SELECT COALESCE(SUM(total_load), 0) AS total_load
         FROM exercise_records
        WHERE user_id = ?`,
      [user_id]
    );

    res.json({
      categoryTotals,
      overallTotal: overall[0].total_load,
    });
  } catch (error) {
    res.status(500).json({ error: "総負荷の取得に失敗しました。" });
  }
};

exports.getWeeklyData = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    const [data] = await query(
      `SELECT 
        CONCAT(YEAR(recorded_at),
               LPAD(WEEK(recorded_at, 1), 2, '0')
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

    const categories = [...new Set(data.map(d => d.category))];
    const combined = {};

    data.forEach(({ week, category, total_load }) => {
      if (!combined[week]) {
        combined[week] = { week, total_load: 0 };
        categories.forEach(c => combined[week][c] = 0);
      }
      combined[week][category] = total_load;
      combined[week].total_load += +total_load;
    });

    res.json({ weeklyData: Object.values(combined) });
  } catch (error) {
    res.status(500).json({ error: "週ごとのデータ取得に失敗しました。" });
  }
};