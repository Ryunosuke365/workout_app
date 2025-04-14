require("dotenv").config(); // .envファイルの環境変数を読み込む
const app = require("./app");

// サーバーのポートとホストの設定
const PORT = 5000;
const HOST = "0.0.0.0";

// サーバー起動
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
