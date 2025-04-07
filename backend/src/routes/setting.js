const express = require("express");
const {
  deleteAccount,
  changePassword,
  getUserStats,
  getAvailableDates,
  getDailyHistory,
  updateExerciseRecord,
  deleteExerciseRecord
} = require("../controllers/setting");
const router = express.Router();

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

// トレーニング記録編集のルーティング
router.put("/records/:record_id", updateExerciseRecord);

// トレーニング記録削除のルーティング
router.delete("/records/:record_id", deleteExerciseRecord);

module.exports = router;
