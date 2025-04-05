const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

// シークレットキーの存在チェック
if (!SECRET_KEY) {
    console.error("🚨 環境変数 SECRET_KEY が設定されていません。");
    process.exit(1); // サーバーを強制終了
}

// トークン認証のメイン処理
const authenticateToken = (req, res, next) => {
    try {
        // 認証ヘッダーを取得
        const authHeader = req.headers["authorization"];
        console.log("🔍 [Middleware] Authorization Header:", authHeader);

        // トークンを抽出
        const token = authHeader && authHeader.split(" ")[1];

        // トークンの存在チェック
        if (!token) {
            console.error("🚨 認証エラー: トークンがありません");
            return res.status(401).json({ error: "⚠️ 認証トークンがありません。" });
        }

        console.log("🔍 [Middleware] Extracted Token:", token);

        // トークンの検証
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                console.error("🚨 認証エラー: トークンが無効または期限切れ", err);
                return res.status(403).json({ error: "⚠️ トークンが無効または期限切れです。" });
            }

            // ユーザー情報をリクエストに追加
            req.user = { user_id: user.user_id };

            // 開発環境の場合のみログを出力
            if (process.env.NODE_ENV !== "production") {
                console.log("✅ 認証成功！デコードしたユーザー:", req.user);
            }

            // 次のミドルウェアへ進む
            next();
        });
    } catch (error) {
        // エラー発生時のログ出力とレスポンス
        console.error("🚨 認証処理エラー:", error);
        return res.status(500).json({ error: "❌ 認証処理中にエラーが発生しました。" });
    }
};

module.exports = { authenticateToken };
