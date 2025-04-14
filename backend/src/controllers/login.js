const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

//ユーザーIDに対応するユーザーを取得
const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute(
    "SELECT id, user_id, password FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null;
};

//平文のパスワードとハッシュ化されたパスワードを比較
const comparePassword = (inputPassword, hashedPassword) =>
  bcrypt.compare(inputPassword, hashedPassword);

//ユーザーのログイン処理
exports.loginUser = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    // 入力チェック
    if (!user_id || !password) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    // ユーザーが存在するかチェック
    const user = await findUserByUserId(user_id);
    if (!user) {
      return res
        .status(400)
        .json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    // パスワードの照合
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    // JWT トークンの発行（SECRET_KEY が正しく設定されている前提）
    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.SECRET_KEY, // 事前にSECRET_KEYが存在することを確認
      { expiresIn: "12h" }
    );

    // レスポンスとしてトークンとユーザーIDを返却
    return res.status(200).json({
      message: "ログイン成功",
      token,
      user_id: user.user_id,
    });
  } catch (error) {
    // 予期せぬエラーの処理
    console.error("ログイン処理中にエラーが発生しました:", error);
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};
