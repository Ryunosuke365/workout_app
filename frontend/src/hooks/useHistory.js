// hooks/useHistory.js
import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

// APIのベースURL（履歴関連）
const API_URL = "https://loadlog.jp/api/history";

/**
 * useHistory カスタムフック
 * ・日次履歴データの取得と管理
 * ・合計データと週次グラフデータの取得
 * ・利用可能な日付一覧の取得
 */
const useHistory = () => {
  const { handleAuthError, authGet } = useAuth();

  // 日次履歴データ
  const [dailyHistory, setDailyHistory] = useState([]);
  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState("");
  // 利用可能な日付一覧
  const [availableDates, setAvailableDates] = useState([]);
  // 部位ごとの合計負荷
  const [categoryTotals, setCategoryTotals] = useState([]);
  // 全体合計負荷
  const [overallTotal, setOverallTotal] = useState(0);
  // 週次データ
  const [weeklyData, setWeeklyData] = useState([]);
  // 選択中の集計項目
  const [selectedCategory, setSelectedCategory] = useState("total_load");
  // 軸説明表示
  const [showAxisHelp, setShowAxisHelp] = useState(false);
  // 期間フィルター
  const [periodFilter, setPeriodFilter] = useState("3months");
  // メッセージ
  const [message, setMessage] = useState("");

  // 日付一覧取得
  const fetchAvailableDates = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/dates`);
      const dates = res.data.dates ?? [];
      setAvailableDates(dates);
      return dates;
    } catch (err) {
      handleAuthError(err, setMessage, "日付一覧の取得に失敗しました");
      return [];
    }
  }, [authGet, handleAuthError]);

  // 日次履歴取得
  const fetchDailyHistory = useCallback(
    async (date) => {
      try {
        const res = await authGet(`${API_URL}/daily?date=${date}`);
        setDailyHistory(res.data.dailyHistory ?? []);
      } catch (err) {
        handleAuthError(err, setMessage, "日次履歴の取得に失敗しました");
      }
    },
    [authGet, handleAuthError]
  );

  // 合計データ取得
  const fetchTotals = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/totals`);
      setCategoryTotals(res.data.categoryTotals ?? []);
      setOverallTotal(res.data.overallTotal ?? 0);
    } catch (err) {
      handleAuthError(err, setMessage, "合計データの取得に失敗しました");
    }
  }, [authGet, handleAuthError]);

  // 週次データ取得
  const fetchGraphData = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/weekly`);
      setWeeklyData(res.data.weeklyData ?? []);
    } catch (err) {
      handleAuthError(err, setMessage, "グラフ用データの取得に失敗しました");
    }
  }, [authGet, handleAuthError]);

  // 初期データ取得
  const fetchInitialData = useCallback(async () => {
    try {
      await Promise.all([fetchTotals(), fetchGraphData()]);
      const dates = await fetchAvailableDates();
      if (dates.length > 0) {
        const firstDate = dates[0];
        setSelectedDate(firstDate);
        await fetchDailyHistory(firstDate);
      }
    } catch (err) {
      handleAuthError(err, setMessage, "初期データの取得に失敗しました");
    }
  }, [fetchTotals, fetchGraphData, fetchAvailableDates, fetchDailyHistory, handleAuthError]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    dailyHistory,
    selectedDate,
    availableDates,
    categoryTotals,
    overallTotal,
    weeklyData,
    selectedCategory,
    showAxisHelp,
    periodFilter,
    message,
    setSelectedDate,
    setSelectedCategory,
    setShowAxisHelp,
    setPeriodFilter,
    fetchDailyHistory,
  };
};

export default useHistory;
