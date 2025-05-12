const express = require("express");
const {
  getDailyHistory,    // 指定日の履歴取得
  getAvailableDates,  // 記録のある日付一覧取得
  getTotalLoad,       // 部位別・全体の総負荷量取得
  getWeeklyData,      // 週別の負荷推移取得
} = require("../controllers/history");

const router = express.Router();

// 日別履歴取得
router.get("/daily", getDailyHistory);

// 記録が存在する日付一覧
router.get("/dates", getAvailableDates);

// 総負荷量
router.get("/totals", getTotalLoad);

// 週ごとの負荷推移
router.get("/weekly", getWeeklyData);

module.exports = router;
