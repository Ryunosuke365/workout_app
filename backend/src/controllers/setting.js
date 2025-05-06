const db = require("../db");
const bcrypt = require("bcrypt");
const query = (sql, params) => db.execute(sql, params);
const extractUserId = (req) => req.user.user_id;

exports.changePassword = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "現在のパスワードと新しいパスワードを入力してください。" });
    }

    const isValidNewPassword = (newPassword) =>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(newPassword);
    if(!isValidNewPassword(newPassword)) {
      return res.status(400).json({ error: "パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。"})
    }

    const [rows] = await query("SELECT password FROM users WHERE user_id = ?", [
      user_id,
    ]);

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: "現在のパスワードが間違っています。" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedPassword,
      user_id,
    ]);

    res.json({ message: "パスワードを変更しました。" });
  } catch (error) {
    res.status(500).json({ error: "パスワード変更に失敗しました。" });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const user_id = extractUserId(req);

    const [userRows] = await query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS registrationDate
         FROM users
        WHERE user_id = ?`,
      [user_id]
    );

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
    res.status(500).json({ error: "登録日とトレーニング日数の取得に失敗しました。" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "パスワードを入力してください。" });
    }

    const [rows] = await query("SELECT password FROM users WHERE user_id = ?", [
      user_id,
    ]);

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(422).json({ error: "パスワードが間違っています。" });
    }

    await query("DELETE FROM exercise_records WHERE user_id = ?", [user_id]);
    await query("DELETE FROM exercises WHERE user_id = ?", [user_id]);
    await query("DELETE FROM users WHERE user_id = ?", [user_id]);

    res.json({ message: "アカウントを削除しました。" });
  } catch (error) {
    res.status(500).json({ error: "アカウントの削除に失敗しました。" });
  }
};

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
    res.status(500).json({ error: "データの取得に失敗しました。" });
  }
};

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

exports.updateExerciseRecord = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { record_id, weight, reps } = req.body;

    if (!record_id || !weight || !reps) {
      return res.status(400).json({ error: "必要なデータが不足しています。" });
    }

    const total_load = weight * reps;

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

exports.deleteExerciseRecord = async (req, res) => {
  try {
    const user_id = extractUserId(req);
    const { record_id } = req.params;

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
