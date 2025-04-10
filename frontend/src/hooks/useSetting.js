import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

const API_URL = "https://loadlog.jp/api/setting";

const useSetting = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [registrationDate, setRegistrationDate] = useState("");
  const [workoutDays, setWorkoutDays] = useState(null);

  const { handleAuthError, removeToken, authGet, authPut, authDelete } = useAuth();

  const handlePasswordChange = useCallback(async () => {
    try {
      const response = await authPut(`${API_URL}/account/password`, { currentPassword, newPassword });
      setMessage(response.data.message || "パスワードを更新しました");
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "パスワード変更に失敗しました。");
    }
  }, [currentPassword, newPassword, authPut]);

  const handleAccountDelete = useCallback(async () => {
    try {
      await authDelete(`${API_URL}/account`);
      return true;
    } catch (err) {
      setMessage(err.response?.data?.error || "アカウント削除に失敗しました。");
      return false;
    }
  }, [authDelete]);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await authGet(`${API_URL}/stats`);
      setRegistrationDate(response.data.registrationDate);
      setWorkoutDays(response.data.workoutDays);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [authGet, handleAuthError]);

  const fetchDailyHistory = useCallback(async (dateStr) => {
    try {
      const response = await authGet(`${API_URL}/daily?date=${dateStr}`);
      setDailyHistory(response.data.dailyHistory ?? []);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [authGet, handleAuthError]);

  const fetchAvailableDates = useCallback(async () => {
    try {
      const response = await authGet(`${API_URL}/dates`);
      const dates = response.data.dates || [];

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
  }, [fetchDailyHistory, authGet, handleAuthError]);

  const handleSaveEdit = useCallback(async (index) => {
    try {
      const response = await authPut(`${API_URL}/records/${editingRecord.id}`, {
        record_id: editingRecord.id,
        weight: editingRecord.weight,
        reps: editingRecord.reps,
      });

      setMessage(response.data.message || "記録を更新しました。");
      const newHistory = [...dailyHistory];
      newHistory[index] = {
        ...editingRecord,
        total_load: editingRecord.weight * editingRecord.reps,
      };
      setDailyHistory(newHistory);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      setMessage(error.response?.data?.error || "記録更新に失敗しました。");
    }
  }, [dailyHistory, editingRecord, authPut]);

  const handleDeleteRecord = useCallback(async (index) => {
    try {
      const recordId = dailyHistory[index].id;
      const response = await authDelete(`${API_URL}/records/${recordId}`);

      setMessage(response.data.message || "記録を削除しました。");
      setDailyHistory(dailyHistory.filter((_, i) => i !== index));
      fetchUserStats();
    } catch (error) {
      setMessage(error.response?.data?.error || "記録削除に失敗しました。");
    }
  }, [dailyHistory, authDelete, fetchUserStats]);

  const fetchInitialData = useCallback(async () => {
    await fetchUserStats();
    await fetchAvailableDates();
  }, [fetchUserStats, fetchAvailableDates]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    currentPassword,
    newPassword,
    showPasswordForm,
    selectedDate,
    availableDates,
    dailyHistory,
    message,
    editingIndex,
    editingRecord,
    registrationDate,
    workoutDays,
    setCurrentPassword,
    setNewPassword,
    setShowPasswordForm,
    handlePasswordChange,
    handleAccountDelete,
    removeToken,
    fetchDailyHistory,
    setSelectedDate,
    handleSaveEdit,
    handleDeleteRecord,
    setEditingIndex,
    setEditingRecord,
    setMessage
  };
};

export default useSetting;
