const express = require("express");
const {
  getExercisesByCategory,
  addExercise,
  deleteExercise,
  recordMuscleData,
  getDailyMuscleSummary,
} = require("../controllers/measure");
const router = express.Router();

// 認証確認用のルーティング
router.get("/", (req, res) => {
  res.json({ message: "認証成功！", user: req.user });
});

// 種目取得のルーティング（部位ごと）
router.get("/exercises/:category", getExercisesByCategory);

// 新規種目追加のルーティング
router.post("/exercises", addExercise);

// 種目削除のルーティング
router.delete("/:exercise_id", deleteExercise);

// 筋トレ記録のルーティング
router.post("/", recordMuscleData);

// 今日の総負荷データ取得のルーティング
router.get("/daily-muscle-summary", getDailyMuscleSummary);

module.exports = router;
