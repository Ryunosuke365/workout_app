const express = require("express");
const {
  getExercisesByCategory,
  addExercise,
  deleteExercise,
  recordExerciseData,
  getDailyLoadSummary,
} = require("../controllers/measure");
const router = express.Router();

// 種目取得のルーティング（部位ごと）
router.get("/exercises/:category", getExercisesByCategory);

// 新規種目追加のルーティング
router.post("/exercises", addExercise);

// 種目削除のルーティング
router.delete("/:exercise_id", deleteExercise);

// トレーニング記録のルーティング
router.post("/", recordExerciseData);

// 今日の総負荷データ取得のルーティング
router.get("/daily-load-summary", getDailyLoadSummary);

module.exports = router;
