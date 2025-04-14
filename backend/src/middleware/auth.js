const jwt = require("jsonwebtoken");

// SECRET_KEY を環境変数から取得
const SECRET_KEY = process.env.SECRET_KEY;

// SECRET_KEY が未設定の場合はエラーを出し、プロセスを終了
if (!SECRET_KEY) {
  console.error('環境変数 "SECRET_KEY" が設定されていません。');
  process.exit(1);
}

// トークンを検証するミドルウェア
const authenticateToken = (req, res, next) => {
  try {
    // Authorization ヘッダーからトークンを取り出し
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "認証トークンがありません。" });
    }

    // トークンを検証
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          error: "トークンが無効または期限切れです。",
        });
      }

      // 検証に成功したらユーザー情報をリクエストに添付
      req.user = { user_id: decoded.user_id };
      next();
    });
  } catch (error) {
    // 想定外のエラーの場合
    console.error("認証処理中にエラーが発生しました:", error);
    res.status(500).json({ error: "認証処理中にエラーが発生しました。" });
  }
};

module.exports = { authenticateToken };
