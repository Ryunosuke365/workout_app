import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  process.exit(1);
}

export interface AuthedRequest extends Request {
  user?: { user_id: number | string };
}

export const authenticateToken = (req: AuthedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({
        error: "認証トークンがありません。",
        source: "authenticateToken",
      });
      return;
    }

    jwt.verify(token, SECRET_KEY as string, (err, decoded) => {
      if (err || !decoded) {
        res.status(401).json({
          error: "トークンが無効または期限切れです。",
          source: "authenticateToken",
        });
        return;
      }

      const payload = decoded as JwtPayload & { user_id?: number | string };
      req.user = { user_id: payload.user_id as number | string };
      next();
    });
  } catch (error) {
    res.status(500).json({
      error: "認証処理中にエラーが発生しました。",
      source: "authenticateToken",
    });
  }
};

export default authenticateToken;