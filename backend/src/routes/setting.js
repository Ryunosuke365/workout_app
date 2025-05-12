const express = require("express");
const {
  deleteAccount,         // アカウント削除
  changePassword,        // パスワード変更
  getUserStats,          // 登録日 & 筋トレ日数取得
  getAvailableDates,     // 記録のある日付一覧
  getDailyHistory,       // 指定日の履歴取得
  updateExerciseRecord,  // トレーニング記録の更新
  deleteExerciseRecord,  // トレーニング記録の削除
} = require("../controllers/setting");

const router = express.Router();

// アカウント削除
router.delete("/account", deleteAccount);

// パスワード変更
router.put("/account/password", changePassword);

// ユーザー情報取得
router.get("/stats", getUserStats);

// 記録がある日付一覧
router.get("/dates", getAvailableDates);

// 指定日の日次履歴取得
router.get("/daily", getDailyHistory);

// トレーニング記録の更新
router.put("/records", updateExerciseRecord);

// トレーニング記録の削除
router.delete("/records/:record_id", deleteExerciseRecord);

module.exports = router;
