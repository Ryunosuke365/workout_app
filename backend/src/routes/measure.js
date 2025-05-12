const express = require("express");
const {
  getExercisesByCategory,   // 部位ごとの種目一覧取得
  addExercise,              // 種目追加
  deleteExercise,           // 種目削除
  recordExerciseData,       // トレーニング記録
  getDailyLoadSummary,      // 当日の総負荷量取得
} = require("../controllers/measure");

const router = express.Router();

// 部位別の種目一覧取得
router.get("/exercises/:category", getExercisesByCategory);

// 種目追加
router.post("/exercises", addExercise);

// 種目削除
router.delete("/:exercise_id", deleteExercise);

// トレーニング記録
router.post("/", recordExerciseData);

// 今日の総負荷量取得
router.get("/daily-load-summary", getDailyLoadSummary);

module.exports = router;
