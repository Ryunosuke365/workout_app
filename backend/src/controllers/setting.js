const db = require("../db");
const bcrypt = require("bcrypt");

// データベースクエリを実行するヘルパー関数
const query = (sql, params) => db.execute(sql, params);
// リクエストからユーザーIDを抽出するヘルパー関数
const extractUserId = (req) => req.user.user_id;

// ユーザーのパスワードを変更します。
exports.changePassword = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { currentPassword, newPassword } = req.body;
    
    // 現在のパスワードと新しいパスワードが入力されているか検証
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "現在のパスワードと新しいパスワードを入力してください。" });
    }

    // 新しいパスワードの形式を検証 (8文字以上、大文字・小文字・数字を各1文字以上含む)
    const isValidNewPassword = (newPassword) =>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(newPassword);
    if(!isValidNewPassword(newPassword)) {
      return res.status(400).json({ error: "パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。"})
    }

    // データベースから現在のパスワードを取得
    const [rows] = await query("SELECT password FROM users WHERE user_id = ?", [
      user_id,
    ]);

    // 入力された現在のパスワードとデータベースのパスワードを比較
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: "現在のパスワードが間違っています。" });
    }

    // 新しいパスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // データベースのパスワードを更新
    await query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedPassword,
      user_id,
    ]);

    res.json({ message: "パスワードを変更しました。" });
  } catch (error) {
    res.status(500).json({ error: "パスワード変更に失敗しました。" });
  }
};

// ユーザーの統計情報（登録日とトレーニング日数）を取得します。
exports.getUserStats = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    // ユーザーの登録日を取得
    const [userRows] = await query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS registrationDate
         FROM users
        WHERE user_id = ?`,
      [user_id]
    );

    // ユーザーの総トレーニング日数を取得 (記録された日付のユニークな数)
    const [countRows] = await query(
      `SELECT COUNT(DISTINCT DATE(recorded_at)) AS workoutDays
         FROM exercise_records
        WHERE user_id = ?`,
      [user_id]
    );

    res.json({
      registrationDate: userRows[0]?.registrationDate || null, // 登録日が存在しない場合はnull
      workoutDays: countRows[0]?.workoutDays || 0, // トレーニング日数が存在しない場合は0
    });
  } catch (error) {
    res.status(500).json({ error: "登録日とトレーニング日数の取得に失敗しました。" });
  }
};

// ユーザーアカウントを削除します。
exports.deleteAccount = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { password } = req.body;

    // パスワードが入力されているか検証
    if (!password) {
      return res.status(400).json({ error: "パスワードを入力してください。" });
    }

    // データベースから現在のパスワードを取得
    const [rows] = await query("SELECT password FROM users WHERE user_id = ?", [
      user_id,
    ]);

    // 入力されたパスワードとデータベースのパスワードを比較
    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(422).json({ error: "パスワードが間違っています。" });
    }

    // 関連するデータを全て削除
    await query("DELETE FROM exercise_records WHERE user_id = ?", [user_id]);
    await query("DELETE FROM exercises WHERE user_id = ?", [user_id]);
    await query("DELETE FROM users WHERE user_id = ?", [user_id]);

    res.json({ message: "アカウントを削除しました。" });
  } catch (error) {
    res.status(500).json({ error: "アカウントの削除に失敗しました。" });
  }
};

// 指定された日付の運動履歴を取得します。
exports.getDailyHistory = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { date } = req.query; // クエリパラメータから日付を取得

    // 指定されたユーザーIDと日付に一致する運動記録と関連する運動種目情報を取得
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
    res.status(500).json({ error: "データの取得に失敗しました。" });
  }
};

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

    res.json({ dates: rows.map((row) => row.date) });
  } catch (error) {
    res.status(500).json({ error: "利用可能な日付の取得に失敗しました。" });
  }
};

// 既存の運動記録を更新します。
exports.updateExerciseRecord = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { record_id, weight, reps } = req.body;

    // 必要なデータが不足していないか検証
    if (!record_id || !weight || !reps) {
      return res.status(400).json({ error: "必要なデータが不足しています。" });
    }

    // 総負荷量を計算
    const total_load = weight * reps;

    // データベースの運動記録を更新
    await query(
      `UPDATE exercise_records
          SET weight = ?, reps = ?, total_load = ?
        WHERE id = ? AND user_id = ?`,
      [weight, reps, total_load, record_id, user_id]
    );

    res.json({ message: "トレーニング記録を更新しました。" });
  } catch (error) {
    res.status(500).json({ error: "記録の更新に失敗しました。" });
  }
};

// 既存の運動記録を削除します。
exports.deleteExerciseRecord = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { record_id } = req.params; // URLパラメータから記録IDを取得

    // データベースから運動記録を削除
    await query(
      `DELETE FROM exercise_records
        WHERE id = ? AND user_id = ?`,
      [record_id, user_id]
    );

    res.json({ message: "トレーニング記録を削除しました。" });
  } catch (error) {
    res.status(500).json({ error: "記録の削除に失敗しました。" });
  }
};
