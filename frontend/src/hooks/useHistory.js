import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

// APIのエンドポイントURL
const API_URL = "https://loadlog.jp/api/history";

// 履歴関連のロジックをまとめたカスタムフック
const useHistory = () => {
  // 認証関連のカスタムフックを利用
  const { handleAuthError, authGet } = useAuth();

  // stateの定義
  const [dailyHistory, setDailyHistory] = useState([]); // 特定の日付の履歴データ
  const [selectedDate, setSelectedDate] = useState(""); // 選択されている日付
  const [availableDates, setAvailableDates] = useState([]); // 履歴が存在する日付のリスト
  const [categoryTotals, setCategoryTotals] = useState([]); // カテゴリ別の合計負荷データ
  const [overallTotal, setOverallTotal] = useState(0); // 全体の合計負荷
  const [weeklyData, setWeeklyData] = useState([]); // 週ごとのグラフ用データ
  const [selectedCategory, setSelectedCategory] = useState("total_load"); // グラフで選択されているカテゴリ
  const [showAxisHelp, setShowAxisHelp] = useState(false); // グラフの軸ヘルプ表示状態
  const [periodFilter, setPeriodFilter] = useState("3months"); // グラフの期間フィルター
  const [message, setMessage] = useState(""); // ユーザーへのメッセージ

  // 利用可能な日付を取得する関数
  const fetchAvailableDates = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/dates`);
      const dates = res.data.dates ?? []; // APIからのレスポンス、なければ空配列
      setAvailableDates(dates);
      return dates; // 他の処理で利用するために日付リストを返す
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
      return []; // エラー時は空配列を返す
    }
  }, [authGet, handleAuthError]);

  // 特定の日付の履歴を取得する関数
  const fetchDailyHistory = useCallback(async (date) => {
    try {
      const res = await authGet(`${API_URL}/daily?date=${date}`);
      setDailyHistory(res.data.dailyHistory ?? []); // APIからのレスポンス、なければ空配列
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authGet, handleAuthError]);

  // 合計負荷データを取得する関数 (カテゴリ別と全体)
  const fetchTotals = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/totals`);
      setCategoryTotals(res.data.categoryTotals ?? []); // カテゴリ別合計
      setOverallTotal(res.data.overallTotal ?? 0); // 全体合計
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authGet, handleAuthError]);

  // 週ごとのグラフデータを取得する関数
  const fetchGraphData = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/weekly`);
      setWeeklyData(res.data.weeklyData ?? []); // APIからのレスポンス、なければ空配列
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authGet, handleAuthError]);

  // 初期データを一括で取得する関数
  const fetchInitialData = useCallback(async () => {
    try {
      // 合計負荷とグラフデータを並行して取得
      await Promise.all([fetchTotals(), fetchGraphData()]);
      // 利用可能な日付を取得
      const dates = await fetchAvailableDates();
      // 日付が存在すれば、最初の日付を選択し、その日の履歴を取得
      if (dates.length > 0) {
        const firstDate = dates[0];
        setSelectedDate(firstDate);
        await fetchDailyHistory(firstDate);
      }
    } catch (err) {
      // fetchAvailableDates内でエラー処理されるが、念のためここでもキャッチ
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [fetchTotals, fetchGraphData, fetchAvailableDates, fetchDailyHistory, handleAuthError]);

  // コンポーネントのマウント時に初期データを取得
  useEffect(() => {
    fetchInitialData();
    // fetchInitialDataはuseCallbackでメモ化されているため、初回のみ実行される
  }, [fetchInitialData]);

  // フックが提供する値と関数
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

    // state更新関数
    setSelectedDate,
    setSelectedCategory,
    setShowAxisHelp,
    setPeriodFilter,

    // データ取得関数 (個別呼び出し用)
    fetchDailyHistory,
  };
};

export default useHistory;
