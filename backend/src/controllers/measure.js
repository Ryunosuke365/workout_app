const db = require("../db");

// SQL実行を行う簡易ユーティリティ
const query = (sql, params) => db.execute(sql, params);

// JWT認証済ユーザーIDを取り出す関数（req.user はミドルウェアで付与される想定）
const extractUserId = (req) => req.user.user_id;

//カテゴリ別の種目一覧を取得
exports.getExercisesByCategory = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { category } = req.params;

    // category が空なら 400 を返す（必要に応じて）
    if (!category) {
      return res.status(400).json({ error: "カテゴリが指定されていません。" });
    }

    const [exercises] = await query(
      "SELECT id, name FROM exercises WHERE user_id = ? AND category = ?",
      [user_id, category]
    );
    res.json(exercises);
  } catch (error) {
    console.error("getExercisesByCategory Error:", error);
    res.status(500).json({ error: "種目の取得に失敗しました。" });
  }
};

//種目を追加
exports.addExercise = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { name, category } = req.body;

    // 種目名は必須
    if (!name) {
      return res.status(400).json({ error: "種目名は必須です。" });
    }

    await query(
      "INSERT INTO exercises (user_id, name, category) VALUES (?, ?, ?)",
      [user_id, name, category]
    );
    res.status(201).json({ message: "種目を追加しました" });
  } catch (error) {
    console.error("addExercise Error:", error);
    res.status(500).json({ error: "種目の追加に失敗しました。" });
  }
};

//種目を削除（関連するレコードも削除）
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
    console.error("deleteExercise Error:", error);
    res.status(500).json({ error: "種目の削除に失敗しました。" });
  }
};

//トレーニングデータを記録
exports.recordExerciseData = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { exercise_id, weight, reps } = req.body;

    // 重量・回数は必須
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
    console.error("recordExerciseData Error:", error);
    res.status(500).json({ error: "データ保存に失敗しました。" });
  }
};

//今日のトータル負荷情報を取得
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
    console.error("getDailyLoadSummary Error:", error);
    res.status(500).json({ error: "データ取得に失敗しました。" });
  }
};
