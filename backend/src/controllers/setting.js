const db = require("../db");
const bcrypt = require("bcrypt");

//DBクエリを簡易実行するユーティリティ関数
const query = (sql, params) => db.execute(sql, params);

//リクエストからユーザーIDを抽出（JWTミドルウェアで設定済み）
const extractUserId = (req) => req.user.user_id;

//パスワードを変更する
exports.changePassword = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { currentPassword, newPassword } = req.body;

    // 入力チェック
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "現在のパスワードと新しいパスワードを入力してください。" });
    }

    // DBから現在のパスワードハッシュを取得
    const [rows] = await query("SELECT password FROM users WHERE user_id = ?", [
      user_id,
    ]);

    // 現在のパスワードが正しいか判定
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: "現在のパスワードが間違っています。" });
    }

    // 新しいパスワードをハッシュ化して更新
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedPassword,
      user_id,
    ]);

    res.json({ message: "パスワードを変更しました。" });
  } catch (error) {
    console.error("changePassword Error:", error);
    res.status(500).json({ error: "パスワード変更に失敗しました。" });
  }
};

//ユーザー登録日とトレーニング日数を取得する
exports.getUserStats = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    // ユーザー登録日を取得
    const [userRows] = await query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS registrationDate
         FROM users
        WHERE user_id = ?`,
      [user_id]
    );

    // トレーニングした日数を取得
    const [countRows] = await query(
      `SELECT COUNT(DISTINCT DATE(recorded_at)) AS workoutDays
         FROM exercise_records
        WHERE user_id = ?`,
      [user_id]
    );

    res.json({
      registrationDate: userRows[0]?.registrationDate || null,
      workoutDays: countRows[0]?.workoutDays || 0,
    });
  } catch (error) {
    console.error("getUserStats Error:", error);
    res
      .status(500)
      .json({ error: "登録日とトレーニング日数の取得に失敗しました。" });
  }
};

//アカウントを削除する（関連データをすべて削除）
exports.deleteAccount = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { password } = req.body;

    // パスワード確認
    if (!password) {
      return res.status(400).json({ error: "パスワードを入力してください。" });
    }

    // DBから現在のパスワードハッシュを取得
    const [rows] = await query("SELECT password FROM users WHERE user_id = ?", [
      user_id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "ユーザーが見つかりません。" });
    }

    // パスワードが正しいか判定
    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: "パスワードが間違っています。" });
    }

    // 関連テーブルからユーザー情報を削除
    await query("DELETE FROM exercise_records WHERE user_id = ?", [user_id]);
    await query("DELETE FROM exercises WHERE user_id = ?", [user_id]);
    await query("DELETE FROM users WHERE user_id = ?", [user_id]);

    res.json({ message: "アカウントを削除しました。" });
  } catch (error) {
    console.error("deleteAccount Error:", error);
    res.status(500).json({ error: "アカウントの削除に失敗しました。" });
  }
};

//指定した日付のトレーニング記録を取得
exports.getDailyHistory = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { date } = req.query;

    const [rows] = await query(
      `SELECT e.category,
              e.name AS exercise,
              r.weight,
              r.reps,
              r.total_load,
              r.id
         FROM exercise_records AS r
         JOIN exercises AS e ON r.exercise_id = e.id
        WHERE r.user_id = ?
          AND DATE(r.recorded_at) = ?`,
      [user_id, date]
    );

    res.json({ dailyHistory: rows });
  } catch (error) {
    console.error("getDailyHistory Error:", error);
    res.status(500).json({ error: "データの取得に失敗しました。" });
  }
};

//トレーニングを行った日付一覧を降順で取得
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
    console.error("getAvailableDates Error:", error);
    res
      .status(500)
      .json({ error: "利用可能な日付の取得に失敗しました。" });
  }
};

//トレーニング記録を更新
exports.updateExerciseRecord = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { record_id, weight, reps } = req.body;

    // 必須項目チェック
    if (!record_id || !weight || !reps) {
      return res.status(400).json({ error: "必要なデータが不足しています。" });
    }

    const total_load = weight * reps;

    const [result] = await query(
      `UPDATE exercise_records
          SET weight = ?, reps = ?, total_load = ?
        WHERE id = ? AND user_id = ?`,
      [weight, reps, total_load, record_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "記録が見つかりませんでした。" });
    }

    res.json({ message: "トレーニング記録を更新しました。" });
  } catch (error) {
    console.error("updateExerciseRecord Error:", error);
    res.status(500).json({ error: "記録の更新に失敗しました。" });
  }
};

//トレーニング記録を削除
exports.deleteExerciseRecord = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { record_id } = req.params;

    const [result] = await query(
      `DELETE FROM exercise_records
        WHERE id = ? AND user_id = ?`,
      [record_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "記録が見つかりませんでした。" });
    }

    res.json({ message: "トレーニング記録を削除しました。" });
  } catch (error) {
    console.error("deleteExerciseRecord Error:", error);
    res.status(500).json({ error: "記録の削除に失敗しました。" });
  }
};
