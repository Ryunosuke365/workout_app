const express = require("express");
const {
    getDailyHistory,
    getAvailableDates,
    getTotalLoad,
    getWeeklyData
} = require("../controllers/history");
const router = express.Router();

// 日ごとの履歴取得のルーティング
router.get("/daily", getDailyHistory);

// 利用可能な日付リスト取得のルーティング
router.get("/dates", getAvailableDates);

// 総負荷量取得のルーティング
router.get("/totals", getTotalLoad);

// 週ごとのデータ取得のルーティング
router.get("/weekly", getWeeklyData);

module.exports = router;
