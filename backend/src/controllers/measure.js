const db = require("../db");

// データベースクエリを実行するヘルパー関数
const query = (sql, params) => db.execute(sql, params);
// リクエストからユーザーIDを抽出するヘルパー関数
const extractUserId = (req) => req.user.user_id;

// カテゴリに基づいて運動種目を取得します。
exports.getExercisesByCategory = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { category } = req.params; // URLパラメータからカテゴリを取得

    // 指定されたユーザーIDとカテゴリに一致する運動種目をデータベースから取得
    const [exercises] = await query(
      "SELECT id, name FROM exercises WHERE user_id = ? AND category = ?",
      [user_id, category]
    );
    res.json(exercises); // 取得した運動種目をJSON形式で返す
  } catch (error) {
    res.status(500).json({ error: "種目の取得に失敗しました。" });
  }
};

// 当日の総負荷量サマリーを取得します。
exports.getDailyLoadSummary = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    // 当日の運動記録と関連する運動種目情報をデータベースから取得
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
         AND DATE(r.recorded_at) = CURDATE()`, // CURDATE() を使用して当日の記録のみを取得
      [user_id]
    );

    // 記録から総負荷量を計算
    const totalLoad = records.reduce((sum, record) => sum + record.total_load, 0);

    res.json({ records, totalLoad }); // 記録と総負荷量をJSON形式で返す
  } catch (error) {
    res.status(500).json({ error: "データ取得に失敗しました。" });
  }
};

// 新しい運動種目を追加します。
exports.addExercise = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { name, category } = req.body; // リクエストボディから運動種目名とカテゴリを取得

    // 運動種目名が空でないかバリデーション
    if (!name.trim()) {
      return res.status(400).json({ error: "種目名は必須です。" });
    }

    // 新しい運動種目をデータベースに挿入
    await query(
      "INSERT INTO exercises (user_id, name, category) VALUES (?, ?, ?)",
      [user_id, name, category]
    );
    res.status(201).json({ message: "種目を追加しました" }); // 成功メッセージを返す
  } catch (error) {
    res.status(500).json({ error: "種目の追加に失敗しました。" });
  }
};

// 既存の運動種目を削除します。
exports.deleteExercise = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { exercise_id } = req.params; // URLパラメータから運動種目IDを取得

    // 関連する運動記録を削除
    await query(
      "DELETE FROM exercise_records WHERE user_id = ? AND exercise_id = ?",
      [user_id, exercise_id]
    );
    // 運動種目自体を削除
    await query("DELETE FROM exercises WHERE user_id = ? AND id = ?", [
      user_id,
      exercise_id,
    ]);

    res.json({ message: "種目を削除しました" }); // 成功メッセージを返す
  } catch (error) {
    res.status(500).json({ error: "種目の削除に失敗しました。" });
  }
};

// 運動データを記録します。
exports.recordExerciseData = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { exercise_id, weight, reps } = req.body; // リクエストボディから運動データ取得

    // 重量と回数が入力されているかバリデーション
    if (!weight || !reps) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    const total_load = weight * reps; // 総負荷量を計算

    // 運動記録をデータベースに挿入
    await query(
      `INSERT INTO exercise_records 
       (user_id, exercise_id, weight, reps, total_load, recorded_at)
       VALUES (?, ?, ?, ?, ?, NOW())`, // NOW() を使用して現在時刻を記録
      [user_id, exercise_id, weight, reps, total_load]
    );

    res.status(201).json({
      message: "トレーニングデータを保存しました",
      total_load, // 保存された総負荷量もレスポンスに含める
    });
  } catch (error) {
    res.status(500).json({ error: "データ保存に失敗しました。" });
  }
};