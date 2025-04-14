const express = require("express");
const { loginUser } = require("../controllers/login");

const router = express.Router();

// ログイン処理
router.post("/", loginUser);

module.exports = router;
