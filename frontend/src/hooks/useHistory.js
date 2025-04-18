import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

// APIのベースURL（履歴関連）
const API_URL = "https://loadlog.jp/api/history";

const useHistory = () => {
  // 認証系処理のカスタムフック
  const { handleAuthError, authGet } = useAuth();

  // 日次履歴データ
  const [dailyHistory, setDailyHistory] = useState([]);

  // 現在選択中の日付
  const [selectedDate, setSelectedDate] = useState("");

  // 履歴が存在する日付一覧
  const [availableDates, setAvailableDates] = useState([]);

  // カテゴリーごとの合計負荷
  const [categoryTotals, setCategoryTotals] = useState([]);

  // 全体の合計負荷
  const [overallTotal, setOverallTotal] = useState(0);

  // 週次データ（推移グラフなど用）
  const [weeklyData, setWeeklyData] = useState([]);

  // 現在選択中の集計項目（total_load など）
  const [selectedCategory, setSelectedCategory] = useState("total_load");

  // ユーザーへのメッセージ表示用
  const [message, setMessage] = useState("");

  /**
   * データが存在する日付一覧を取得
   */
  const fetchAvailableDates = useCallback(async () => {
    const res = await authGet(`${API_URL}/dates`);
    const dates = res.data.dates ?? [];
    setAvailableDates(dates);
    return dates;
  }, [authGet]);

  /**
   * 指定した日付の日次履歴を取得
   * @param date 対象日付
   */
  const fetchDailyHistory = useCallback(
    async (date) => {
      try {
        const res = await authGet(`${API_URL}/daily?date=${date}`);
        setDailyHistory(res.data.dailyHistory ?? []);
      } catch (err) {
        handleAuthError(err, setMessage, "日次履歴の取得に失敗しました");
      }
    },
    [authGet, handleAuthError, setMessage]
  );

  /**
   * 合計データ（カテゴリーごとの合計 & 全体合計）を取得
   */
  const fetchTotals = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/totals`);
      setCategoryTotals(res.data.categoryTotals ?? []);
      setOverallTotal(res.data.overallTotal ?? 0);
    } catch (err) {
      handleAuthError(err, setMessage, "合計データの取得に失敗しました");
    }
  }, [authGet, handleAuthError, setMessage]);

  /**
   * グラフ用データを取得
   */
  const fetchGraphData = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/weekly`);
      setWeeklyData(res.data.weeklyData ?? []);
    } catch (err) {
      handleAuthError(err, setMessage, "グラフ用データの取得に失敗しました");
    }
  }, [authGet, handleAuthError, setMessage]);

  /**
   * 初期データの一括取得処理
   * ・合計データ
   * ・週次データ
   * ・日付一覧
   * ・最新日付の履歴
   */
  const fetchInitialData = useCallback(async () => {
    try {
      // 合計データ & 週次データは並列で取得
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
  }, [
    fetchTotals,
    fetchGraphData,
    fetchAvailableDates,
    fetchDailyHistory,
    handleAuthError,
    setMessage,
  ]);

  /**
   * 初期表示時のデータ取得
   */
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    // ステート
    dailyHistory,
    selectedDate,
    availableDates,
    categoryTotals,
    overallTotal,
    weeklyData,
    selectedCategory,
    message,

    // ステートのSetter
    setSelectedDate,
    setSelectedCategory,
    setMessage,

    // 操作系関数
    fetchDailyHistory,
  };
};

export default useHistory;
