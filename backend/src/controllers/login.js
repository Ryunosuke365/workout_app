const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute(
    "SELECT id, user_id, password FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const comparePassword = (inputPassword, hashedPassword) =>
  bcrypt.compare(inputPassword, hashedPassword);

exports.loginUser = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    const user = await findUserByUserId(user_id);
    if (!user) {
      return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
    }

    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.SECRET_KEY,
      { expiresIn: "12h" }
    );

    return res.status(200).json({
      message: "ログイン成功",
      token,
      user_id: user.user_id,
    });
  } catch (error) {
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};
