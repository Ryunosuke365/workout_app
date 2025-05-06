const db = require("../db");
const query = (sql, params) => db.execute(sql, params);
const extractUserId = (req) => req.user.user_id;

exports.getExercisesByCategory = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { category } = req.params;

    const [exercises] = await query(
      "SELECT id, name FROM exercises WHERE user_id = ? AND category = ?",
      [user_id, category]
    );
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: "種目の取得に失敗しました。" });
  }
};

exports.getDailyLoadSummary = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const [records] = await query(
      `SELECT 
         e.category,
         e.name,
         r.weight,
         r.reps,
         r.total_load
       FROM exercise_records AS r
       JOIN exercises AS e ON r.exercise_id = e.id
       WHERE r.user_id = ?
         AND DATE(r.recorded_at) = CURDATE()`,
      [user_id]
    );

    const totalLoad = records.reduce((sum, record) => sum + record.total_load, 0);

    res.json({ records, totalLoad });
  } catch (error) {
    res.status(500).json({ error: "データ取得に失敗しました。" });
  }
};

exports.addExercise = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { name, category } = req.body;

    if (!name.trim()) {
      return res.status(400).json({ error: "種目名は必須です。" });
    }

    await query(
      "INSERT INTO exercises (user_id, name, category) VALUES (?, ?, ?)",
      [user_id, name, category]
    );
    res.status(201).json({ message: "種目を追加しました" });
  } catch (error) {
    res.status(500).json({ error: "種目の追加に失敗しました。" });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { exercise_id } = req.params;

    await query(
      "DELETE FROM exercise_records WHERE user_id = ? AND exercise_id = ?",
      [user_id, exercise_id]
    );
    await query("DELETE FROM exercises WHERE user_id = ? AND id = ?", [
      user_id,
      exercise_id,
    ]);

    res.json({ message: "種目を削除しました" });
  } catch (error) {
    res.status(500).json({ error: "種目の削除に失敗しました。" });
  }
};

exports.recordExerciseData = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { exercise_id, weight, reps } = req.body;

    if (!weight || !reps) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    const total_load = weight * reps;

    await query(
      `INSERT INTO exercise_records 
       (user_id, exercise_id, weight, reps, total_load, recorded_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [user_id, exercise_id, weight, reps, total_load]
    );

    res.status(201).json({
      message: "トレーニングデータを保存しました",
      total_load,
    });
  } catch (error) {
    res.status(500).json({ error: "データ保存に失敗しました。" });
  }
};