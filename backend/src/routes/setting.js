const express = require("express");
const {
  deleteAccount,
  changePassword,
  getUserStats,
  getAvailableDates,
  getDailyHistory,
  updateMuscleRecord,
  deleteMuscleRecord
} = require("../controllers/setting");
const router = express.Router();

// 認証確認用のルーティング
router.get("/", (req, res) => {
  res.json({ message: "認証成功！", user: req.user });
});

// アカウント削除のルーティング
router.delete("/account", deleteAccount);

// パスワード変更のルーティング
router.put("/account/password", changePassword);

// ユーザースタッツ取得のルーティング
router.get("/stats", getUserStats);

// 利用可能な日付リスト取得のルーティング
router.get("/dates", getAvailableDates);

// 日ごとの履歴取得のルーティング
router.get("/daily", getDailyHistory);

// 筋トレ記録編集のルーティング
router.put("/records/:record_id", updateMuscleRecord);

// 筋トレ記録削除のルーティング
router.delete("/records/:record_id", deleteMuscleRecord);

module.exports = router;
