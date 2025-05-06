const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// ユーザーIDでユーザーを検索する関数
const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute(
    "SELECT id, user_id, password FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null; // ユーザーが存在すればユーザー情報を、存在しなければ null を返す
};

// 入力されたパスワードとハッシュ化されたパスワードを比較する関数
const comparePassword = (inputPassword, hashedPassword) =>
  bcrypt.compare(inputPassword, hashedPassword); // パスワードが一致すれば true を返す

// ユーザーログイン処理を行う関数
exports.loginUser = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    // 入力値のバリデーション: 全ての項目が入力されているか
    if (!user_id || !password) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    // ユーザーIDでユーザーを検索
    const user = await findUserByUserId(user_id);
    // ユーザーが存在しない場合
    if (!user) {
      return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    // パスワードの比較
    const isMatch = await comparePassword(password, user.password);
    // パスワードが一致しない場合
    if (!isMatch) {
      return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    // JWTトークンの生成
    const token = jwt.sign(
      { user_id: user.user_id }, // ペイロード
      process.env.SECRET_KEY, // 秘密鍵
      { expiresIn: "12h" } // 有効期限
    );

    // ログイン成功レスポンス
    return res.status(200).json({
      message: "ログイン成功",
      token,
      user_id: user.user_id,
    });
  } catch (error) {
    // エラーハンドリング
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};
