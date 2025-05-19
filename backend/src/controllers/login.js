const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// ユーザーIDに基づいてユーザーを検索します。
const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute(
    "SELECT user_id, password FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// 入力されたパスワードとハッシュ化されたパスワードを比較します。
const comparePassword = (inputPassword, hashedPassword) =>
  bcrypt.compare(inputPassword, hashedPassword);

// ユーザーのログイン処理を行います。
exports.loginUser = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    // ユーザーIDとパスワードが提供されているか確認
    if (!user_id || !password) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    // ユーザーIDでユーザーを検索
    const user = await findUserByUserId(user_id);
    if (!user) {
      return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    // パスワードを比較
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    // JWTを生成
    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.SECRET_KEY,
      { expiresIn: "12h" }
    );

    // ログイン成功レスポンス
    return res.status(200).json({
      message: "ログイン成功",
      token,
      user_id: user.user_id,
    });
  } catch (error) {
    // サーバーエラー処理
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};
