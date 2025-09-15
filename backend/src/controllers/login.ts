import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db";

const findUserByUserId = async (user_id: string): Promise<any | null> => {
  const [rows]: any = await db.execute(
    "SELECT user_id, password FROM users WHERE user_id = ?",
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const comparePassword = (inputPassword: string, hashedPassword: string) =>
  bcrypt.compare(inputPassword, hashedPassword);

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, password } = req.body as { user_id?: string; password?: string };

    if (!user_id || !password) {
      res.status(400).json({ error: "すべての項目を入力してください。" });
      return;
    }

    const user = await findUserByUserId(user_id);
    if (!user) {
      res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
      return;
    }

    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.SECRET_KEY as string,
      { expiresIn: "12h" }
    );

    res.status(200).json({ message: "ログイン成功", token, user_id: user.user_id });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};

export default { loginUser };