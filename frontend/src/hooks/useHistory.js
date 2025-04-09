import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

// APIエンドポイントの定義
const API_URL = "https://loadlog.jp/api/history";

const useHistory = () => {
  // 認証フックの利用（トークン付きGET & 認証エラー処理）
  const { handleAuthError, authGet } = useAuth();

  // 状態管理
  const [dailyHistory, setDailyHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("total_load");

  // ③ 利用可能な日付一覧を取得（/dates）
  const fetchAvailableDates = useCallback(async () => {
    const response = await authGet(`${API_URL}/dates`);
    const dates = response.data.dates || [];
    setAvailableDates(dates);
    return dates;
  }, [authGet]);

  // ① 日付ごとの履歴を取得（例: /daily?date=2025-04-06）
  const fetchDailyHistory = useCallback(async (dateStr) => {
    try {
      const response = await authGet(`${API_URL}/daily?date=${dateStr}`);
      setDailyHistory(response.data.dailyHistory ?? []);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [authGet, handleAuthError, setMessage]);

  // ② 各部位・総合の負荷合計を取得（/totals）
  const fetchTotals = useCallback(async () => {
    const response = await authGet(`${API_URL}/totals`);
    setCategoryTotals(response.data.categoryTotals ?? []);
    setOverallTotal(response.data.overallTotal ?? 0);
  }, [authGet]);

  // ④ 週ごとの負荷推移を取得（/weekly）
  const fetchWeeklyData = useCallback(async () => {
    const response = await authGet(`${API_URL}/weekly`);
    setWeeklyData(response.data.weeklyData ?? []);
  }, [authGet]);

  // 🧠 初期データ一括取得
  const fetchInitialData = useCallback(async () => {
    try {
      await fetchTotals(); // 総合・部位ごとの合計負荷
      await fetchWeeklyData(); // 週別データ
      const dates = await fetchAvailableDates(); // 記録された日付一覧

      if (dates.length > 0) {
        const initialDate = dates[0];
        setSelectedDate(initialDate);
        await fetchDailyHistory(initialDate); // 初期表示の履歴データ
      }
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [
    fetchTotals,
    fetchWeeklyData,
    fetchAvailableDates,
    fetchDailyHistory,
    handleAuthError,
    setMessage,
    setSelectedDate,
  ]);

  // 初期データ取得を自動実行
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 📅 日付を変更したときの処理
  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
    fetchDailyHistory(newDate);
  }, [fetchDailyHistory]);

  // ✅ フックとして提供する値と関数
  return {
    // 状態
    dailyHistory,
    selectedDate,
    availableDates,
    categoryTotals,
    overallTotal,
    weeklyData,
    message,
    selectedCategory,

    // アクション
    handleDateChange,
    setMessage,
    setSelectedCategory
  };
};

export default useHistory;
