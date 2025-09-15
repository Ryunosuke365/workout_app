import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../db";

const findUserByUserId = async (user_id: string): Promise<boolean> => {
  const [rows]: any = await db.execute(
    "SELECT user_id FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, password, confirm_password } = req.body as {
      user_id?: string;
      password?: string;
      confirm_password?: string;
    };

    if (!user_id || !password || !confirm_password) {
      res.status(400).json({ error: "すべての項目を入力してください。" });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({ error: "パスワードが一致しません。" });
      return;
    }

    if (!/^[A-Za-z\d]{5,}$/.test(user_id)) {
      res.status(400).json({ error: "ユーザーIDは5文字以上の英数字のみで入力してください。" });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      res.status(400).json({
        error: "パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。",
      });
      return;
    }

    if (await findUserByUserId(user_id)) {
      res.status(400).json({ error: "このユーザーIDは既に使用されています。" });
      return;
    }

    const hashed_password = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (user_id, password) VALUES (?, ?)",
      [user_id, hashed_password]
    );

    res.status(201).json({ message: "アカウントが作成されました" });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};

export default { registerUser };