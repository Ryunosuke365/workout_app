const bcrypt = require("bcrypt");
const db = require("../db");

// ユーザーIDでユーザーを検索する関数
const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute(
    "SELECT user_id FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0; // ユーザーが存在すれば true を返す
};

// ユーザー登録処理を行う関数
exports.registerUser = async (req, res) => {
  try {
    const { user_id, password, confirm_password } = req.body;

    // 入力値のバリデーション: 全ての項目が入力されているか
    if (!user_id || !password || !confirm_password) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    // 入力値のバリデーション: パスワードと確認用パスワードが一致するか
    if (password !== confirm_password) {
      return res.status(400).json({ error: "パスワードが一致しません。" });
    }

    // ユーザーIDのバリデーション: 5文字以上の英数字であるか
    if (!/^[A-Za-z\d]{5,}$/.test(user_id)) {
      return res
        .status(400)
        .json({ error: "ユーザーIDは5文字以上の英数字のみで入力してください。" });
    }

    // パスワードのバリデーション: 8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含むか
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
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

    // データベースにユーザー情報を登録
    await db.execute(
      "INSERT INTO users (user_id, password) VALUES (?, ?)",
      [user_id, hashed_password]
    );

    // 登録成功レスポンス
    return res.status(201).json({ message: "アカウントが作成されました" });
  } catch (error) {
    // エラーハンドリング
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};
