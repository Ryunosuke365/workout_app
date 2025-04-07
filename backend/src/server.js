const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = require("./app");

// サーバーの起動
app.listen(5000, "0.0.0.0", () => {
  console.log(`🚀 サーバー起動`);
});
