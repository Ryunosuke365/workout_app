const bcrypt = require("bcrypt");
const db = require("../db");

//指定したユーザーIDが既に存在するかをチェックする関数
const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute(
    "SELECT user_id FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

// ユーザーIDとパスワードのバリデーションルール
const isValidUserId = (user_id) => /^[A-Za-z\d]{5,}$/.test(user_id);
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

//新規ユーザーを登録するコントローラ
exports.registerUser = async (req, res) => {
  try {
    const { user_id, password, confirm_password } = req.body;

    // 必須項目チェック
    if (!user_id || !password || !confirm_password) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    // パスワードと確認用パスワードが一致するか
    if (password !== confirm_password) {
      return res.status(400).json({ error: "パスワードが一致しません。" });
    }

    // ユーザーIDの形式チェック
    if (!isValidUserId(user_id)) {
      return res
        .status(400)
        .json({ error: "ユーザーIDは5文字以上の英数字のみで入力してください。" });
    }

    // パスワードの形式チェック
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          "パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。",
      });
    }

    // ユーザーIDの重複チェック
    if (await findUserByUserId(user_id)) {
      return res.status(400).json({ error: "このユーザーIDは既に使用されています。" });
    }

    // パスワードのハッシュ化
    const hashed_password = await bcrypt.hash(password, 10);

    // データベースに登録
    await db.execute(
      "INSERT INTO users (user_id, password) VALUES (?, ?)",
      [user_id, hashed_password]
    );

    return res.status(201).json({ message: "アカウントが作成されました" });
  } catch (error) {
    // デバッグ用のログ出力（本番ではログを確認しやすいよう工夫）
    console.error(error);
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};
