const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = require("./app");

// サーバーの起動
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 サーバー起動: http://0.0.0.0:5000`);
});
