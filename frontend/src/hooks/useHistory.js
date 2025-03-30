import { useState, useCallback } from "react";
import axios from "axios";
import useAuth from "./auth";

// APIエンドポイントの定義
const API_URL = "http://18.183.224.238/api/history";

const useHistory = () => {
  // 認証フックの利用
  const { handleAuthError, getToken } = useAuth();

  // 状態管理
  const [dailyHistory, setDailyHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [message, setMessage] = useState("");

  // 日付ごとの履歴を取得
  const fetchDailyHistory = useCallback(async (dateStr) => {
    try {
      const token = getToken();
      if (!token) throw new Error("トークンが存在しません");
      
      const response = await axios.get(`${API_URL}/daily?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDailyHistory(response.data.dailyHistory ?? []);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [handleAuthError, getToken]);

  // 初期データ取得
  const fetchInitialData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("トークンが存在しません");
      const headers = { Authorization: `Bearer ${token}` };

      // 筋値合計データの取得
      const totalResponse = await axios.get(`${API_URL}/totals`, { headers });
      setCategoryTotals(totalResponse.data.categoryTotals ?? []);
      setOverallTotal(totalResponse.data.overallTotal ?? 0);

      // 週間データの取得
      const weeklyResponse = await axios.get(`${API_URL}/weekly`, { headers });
      setWeeklyData(weeklyResponse.data.weeklyData ?? []);

      // 利用可能な日付の取得
      const datesResponse = await axios.get(`${API_URL}/dates`, { headers });
      const dates = datesResponse.data.dates || [];
      
      if (dates.length > 0) {
        setAvailableDates(dates);
        const initialDate = dates[0];
        setSelectedDate(initialDate);
        fetchDailyHistory(initialDate);
      } else {
        setAvailableDates([]);
      }
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [fetchDailyHistory, handleAuthError, getToken]);

  // 日付選択時の処理
  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
    fetchDailyHistory(newDate);
  }, [fetchDailyHistory]);

  return {
    // 状態
    dailyHistory,
    selectedDate,
    availableDates,
    categoryTotals,
    overallTotal,
    weeklyData,
    message,
    
    // アクション
    fetchInitialData,
    handleDateChange,
    setMessage
  };
};

export default useHistory; 