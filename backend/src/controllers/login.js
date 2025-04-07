const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// ログインのメイン処理
exports.loginUser = async (req, res) => {
  try {
    // ユーザーIDで検索する関数
    const findUserByUserId = async (user_id) => {
      const [rows] = await db.execute(
        "SELECT id, user_id, password FROM users WHERE user_id = ?",
        [user_id]
      );
      return rows.length > 0 ? rows[0] : null;
    };

    // パスワードを比較する関数
    const comparePassword = async (inputPassword, hashedPassword) => {
      return await bcrypt.compare(inputPassword, hashedPassword);
    };

    // リクエストからデータを取得
    const { user_id, password } = req.body;

    // 必須項目のチェック
    if (!user_id || !password) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    // ユーザーの存在チェック
    const user = await findUserByUserId(user_id);
    if (!user) {
      return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    // パスワードの一致チェック
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    // JWTトークンの生成（有効期限12時間）
    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.SECRET_KEY,
      { expiresIn: "12h" }
    );

    // 成功時のレスポンス
    return res.status(200).json({
      message: "ログイン成功",
      token,
      user_id: user.user_id
    });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("ログインエラー:", error);
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};
