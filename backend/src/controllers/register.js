const bcrypt = require("bcrypt");
const db = require("../db");

const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute(
    "SELECT user_id FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

exports.registerUser = async (req, res) => {
  try {
    const { user_id, password, confirm_password } = req.body;

    if (!user_id || !password || !confirm_password) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: "パスワードが一致しません。" });
    }

    if (!/^[A-Za-z\d]{5,}$/.test(user_id)) {
      return res
        .status(400)
        .json({ error: "ユーザーIDは5文字以上の英数字のみで入力してください。" });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return res.status(400).json({
        error:
          "パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。",
      });
    }

    if (await findUserByUserId(user_id)) {
      return res.status(400).json({ error: "このユーザーIDは既に使用されています。" });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (user_id, password) VALUES (?, ?)",
      [user_id, hashed_password]
    );

    return res.status(201).json({ message: "アカウントが作成されました" });
  } catch (error) {
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};
