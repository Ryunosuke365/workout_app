import { useState, useCallback, useEffect, useMemo } from "react";
import useAuth from "./useAuth";

const API_URL = "http://3.112.2.147/api/history";

const useHistory = () => {
  const { handleAuthError, authGet } = useAuth();

  const [dailyHistory, setDailyHistory] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<any[]>([]);
  const [overallTotal, setOverallTotal] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("total_load");
  const [showAxisHelp, setShowAxisHelp] = useState<boolean>(false);
  const [periodFilter, setPeriodFilter] = useState<string>("3months");
  const [message, setMessage] = useState<string>("");

  const fetchAvailableDates = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/dates`);
      const dates = res.data.dates ?? [];
      setAvailableDates(dates);
      return dates;
    } catch (err: any) {
      handleAuthError(err, setMessage);
      return [];
    }
  }, [authGet, handleAuthError]);

  const fetchDailyHistory = useCallback(async (date: string) => {
    try {
      const res = await authGet(`${API_URL}/daily?date=${date}`);
      setDailyHistory(res.data.dailyHistory ?? []);
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);

  const fetchTotals = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/totals`);
      const categoryTotals = res.data.categoryTotals ?? [];
      const overallTotal = res.data.overallTotal ?? 0;
      setCategoryTotals(categoryTotals);
      setOverallTotal(overallTotal);
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);

  const fetchGraphData = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/weekly`);
      setWeeklyData(res.data.weeklyData ?? []);
    } catch (err: any) {
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
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [fetchTotals, fetchGraphData, fetchAvailableDates, fetchDailyHistory, handleAuthError]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredWeekly = useMemo(() => {
    if (!weeklyData.length) return [] as any[];
    const limit = periodFilter === "3months" ? 13 : periodFilter === "1year" ? 52 : weeklyData.length;
    return [...weeklyData]
      .sort((a: any, b: any) => b.week - a.week)
      .slice(0, limit)
      .sort((a: any, b: any) => a.week - b.week);
  }, [weeklyData, periodFilter]);

  const yMax = useMemo(() => {
    if (!filteredWeekly.length) return 100;
    return Math.max(100, ...filteredWeekly.map((d: any) => +d[selectedCategory as any] || 0));
  }, [filteredWeekly, selectedCategory]);

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

    filteredWeekly,
    yMax,

    setSelectedDate,
    setSelectedCategory,
    setShowAxisHelp,
    setPeriodFilter,

    fetchDailyHistory,
  };
};

export default useHistory;