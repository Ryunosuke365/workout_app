import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

const API_URL = "https://loadlog.jp/api/history";

const useHistory = () => {
  const { handleAuthError, authGet } = useAuth();

  const [dailyHistory, setDailyHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("total_load");
  const [showAxisHelp, setShowAxisHelp] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("3months");
  const [message, setMessage] = useState("");

  const fetchAvailableDates = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/dates`);
      const dates = res.data.dates ?? [];
      setAvailableDates(dates);
      return dates;
    } catch (err) {
      handleAuthError(err, setMessage);
      return [];
    }
  }, [authGet, handleAuthError]);


  const fetchDailyHistory = useCallback(async (date) => {
    try {
      const res = await authGet(`${API_URL}/daily?date=${date}`);
      setDailyHistory(res.data.dailyHistory ?? []);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);


  const fetchTotals = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/totals`);
      setCategoryTotals(res.data.categoryTotals ?? []);
      setOverallTotal(res.data.overallTotal ?? 0);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);


  const fetchGraphData = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/weekly`);
      setWeeklyData(res.data.weeklyData ?? []);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);


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
      handleAuthError(err, setMessage);
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
