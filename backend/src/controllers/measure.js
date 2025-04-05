const db = require("../db");

// 種目取得のメイン処理（部位ごと）
exports.getExercisesByCategory = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { category } = req.params;

    // 種目を取得
    const [exercises] = await db.query(
      "SELECT id, name FROM exercises WHERE user_id = ? AND category = ?",
      [user_id, category]
    );

    // 成功時のレスポンス
    return res.json(exercises);
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 種目取得エラー:", error);
    return res.status(500).json({ error: "❌ 種目の取得に失敗しました。" });
  }
};

// 新規種目追加のメイン処理
exports.addExercise = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { name, category } = req.body;

    // 必須項目のチェック
    if (!name) {
      return res.status(400).json({ error: "⚠️ 種目名は必須です。" });
    }

    // 種目を追加
    await db.query(
      "INSERT INTO exercises (user_id, name, category) VALUES (?, ?, ?)",
      [user_id, name, category]
    );

    // 成功時のレスポンス
    return res.status(201).json({ message: "✅ 種目を追加しました！" });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 種目追加エラー:", error);
    return res.status(500).json({ error: "❌ 種目の追加に失敗しました。" });
  }
};

// 種目削除のメイン処理
exports.deleteExercise = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { exercise_id } = req.params;

    // 筋トレ記録から削除
    await db.query(
      "DELETE FROM muscle_records WHERE user_id = ? AND exercise_id = ?",
      [user_id, exercise_id]
    );

    // 種目から削除
    await db.query(
      "DELETE FROM exercises WHERE user_id = ? AND id = ?",
      [user_id, exercise_id]
    );

    // 成功時のレスポンス
    return res.json({ message: "✅ 種目を削除しました！" });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 種目削除エラー:", error);
    return res.status(500).json({ error: "❌ 種目の削除に失敗しました。" });
  }
};

// 筋トレ記録のメイン処理
exports.recordMuscleData = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { exercise_id, weight, reps } = req.body;

    // 必須項目のチェック
    if (!weight || !reps) {
      return res.status(400).json({ error: "⚠️ すべての項目を入力してください。" });
    }

    // 筋トレ値を計算
    const muscle_value = weight * reps;

    // 筋トレ記録を保存
    await db.query(
      "INSERT INTO muscle_records (user_id, exercise_id, weight, reps, muscle_value, recorded_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [user_id, exercise_id, weight, reps, muscle_value]
    );

    // 成功時のレスポンス
    return res.status(201).json({ message: "✅ 筋トレデータを保存しました！", muscle_value });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 データ保存エラー:", error);
    return res.status(500).json({ error: "❌ データ保存に失敗しました。" });
  }
};

// 今日の総負荷データ取得のメイン処理
exports.getDailyMuscleSummary = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // 今日の筋トレ記録を取得
    const [records] = await db.query(
      `SELECT 
        ex.category,  
        ex.name,
        mr.weight,
        mr.reps,
        mr.muscle_value
      FROM muscle_records AS mr
      INNER JOIN exercises AS ex ON mr.exercise_id = ex.id
      WHERE mr.user_id = ? AND DATE(mr.recorded_at) = CURDATE()`,
      [user_id]
    );

    // 総筋トレ値を計算
    const totalMuscleValue = records.reduce((sum, record) => sum + record.muscleValue, 0);

    // 成功時のレスポンス
    return res.json({ records, totalMuscleValue });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 データ取得エラー:", error);
    return res.status(500).json({ error: "❌ データ取得に失敗しました。" });
  }
};
