const jwt = require("jsonwebtoken");

// 環境変数から秘密鍵を取得
const SECRET_KEY = process.env.SECRET_KEY;

// 秘密鍵が存在しない場合は即終了（セキュリティ確保のため）
if (!SECRET_KEY) {
  process.exit(1);
}

// JWTトークンを認証するミドルウェア
const authenticateToken = (req, res, next) => {
  try {
    // Authorizationヘッダーからトークンを抽出
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      // トークンが存在しない場合は認証エラー
      return res.status(401).json({ 
        error: "認証トークンがありません。", 
        source: "authenticateToken" 
      });
    }

    // トークンの検証
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        // トークンが無効または期限切れの場合
        return res.status(401).json({
          error: "トークンが無効または期限切れです。",
          source: "authenticateToken"
        });
      }

      // 検証に成功した場合、ユーザー情報をリクエストに追加
      req.user = { user_id: decoded.user_id };
      next();
    });
  } catch (error) {
    // その他の認証処理中のエラー
    res.status(500).json({ 
      error: "認証処理中にエラーが発生しました。", 
      source: "authenticateToken" 
    });
  }
};

module.exports = { authenticateToken };
