import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import useAuth from "./useAuth";

// APIエンドポイントの定義
const API_URL = "https://loadlog/api/setting";

const useSetting = () => {
  // ルーターの取得
  const router = useRouter();
  
  // 認証フックの利用
  const { handleAuthError, getToken } = useAuth();

  // アカウント情報用
  const [userId, setUserId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [theme, setTheme] = useState("black");

  // 履歴・日付用
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);

  // メッセージ用
  const [message, setMessage] = useState("");

  // 編集状態管理（履歴テーブル）
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // ユーザー統計
  const [registrationDate, setRegistrationDate] = useState("");
  const [workoutDays, setWorkoutDays] = useState(null);

  // ユーザーIDの取得
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (id) setUserId(id);
  }, []);

  // パスワード変更処理
  const handlePasswordChange = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${API_URL}/account/password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(response.data.message || "パスワードを更新しました");
      
      // 成功したらフォームをクリア
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ パスワード変更に失敗しました。");
    }
  }, [currentPassword, newPassword, getToken]);

  // アカウント削除処理
  const handleAccountDelete = useCallback(async () => {
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true; // 削除成功
    } catch (err) {
      setMessage("❌ アカウント削除に失敗しました。");
      return false; // 削除失敗
    }
  }, [getToken]);

  // ユーザー統計情報の取得
  const fetchUserStats = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRegistrationDate(response.data.registrationDate);
      setWorkoutDays(response.data.workoutDays);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [getToken, handleAuthError]);

  // 選択日付の履歴取得
  const fetchDailyHistory = useCallback(async (dateStr) => {
    try {
      const token = getToken();
      if (!token) {
        handleAuthError({ message: "トークンが存在しません" }, setMessage);
        return;
      }
      
      const response = await axios.get(`${API_URL}/daily?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDailyHistory(response.data.dailyHistory ?? []);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [getToken, handleAuthError]);

  // 利用可能な日付の取得
  const fetchAvailableDates = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        handleAuthError({ message: "トークンが存在しません" }, setMessage);
        return;
      }
      
      const response = await axios.get(`${API_URL}/dates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
  }, [fetchDailyHistory, getToken, handleAuthError]);

  // 履歴編集保存
  const handleSaveEdit = useCallback(async (index) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${API_URL}/records/${editingRecord.id}`,
        {
          record_id: editingRecord.id,
          weight: editingRecord.weight,
          reps: editingRecord.reps,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(response.data.message || "記録を更新しました。");
      const newHistory = [...dailyHistory];
      newHistory[index] = {
        ...editingRecord,
        muscle_value: editingRecord.weight * editingRecord.reps,
      };
      
      setDailyHistory(newHistory);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      setMessage(error.response?.data?.error || "記録更新に失敗しました。");
    }
  }, [dailyHistory, editingRecord, getToken]);

  // 履歴削除処理
  const handleDeleteRecord = useCallback(async (index) => {
    try {
      const token = getToken();
      const recordId = dailyHistory[index].id;
      const response = await axios.delete(`${API_URL}/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(response.data.message || "記録を削除しました。");
      setDailyHistory(dailyHistory.filter((_, i) => i !== index));
    } catch (error) {
      setMessage(error.response?.data?.error || "記録削除に失敗しました。");
    }
  }, [dailyHistory, getToken]);

  // ログアウト処理
  const handleLogout = useCallback(() => {
    localStorage.clear();
    router.push("/login");
  }, [router]);

  // アカウント削除の確認処理
  const confirmAndDeleteAccount = useCallback(async () => {
    if (!confirm("本当にアカウントを削除しますか？")) return;
    const success = await handleAccountDelete();
    if (success) {
      localStorage.clear();
      router.push("/register");
    }
  }, [handleAccountDelete, router]);

  // 初期データの取得
  const fetchInitialData = useCallback(() => {
    fetchUserStats();
    fetchAvailableDates();
  }, [fetchUserStats, fetchAvailableDates]);

  // 日付選択時の処理
  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
    fetchDailyHistory(newDate);
  }, [fetchDailyHistory]);

  // 履歴編集開始
  const handleEditRecord = useCallback((index) => {
    setEditingIndex(index);
    setEditingRecord({ ...dailyHistory[index] });
  }, [dailyHistory]);

  // パスワードフォーム表示切り替え
  const togglePasswordForm = useCallback(() => {
    setShowPasswordForm(prev => !prev);
  }, []);

  // 日付表示のフォーマット
  const formatDateForDisplay = useCallback((dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // 編集中のレコード更新処理
  const updateEditingRecord = useCallback((field, value) => {
    setEditingRecord(prev => ({
      ...prev,
      [field]: Number(value)
    }));
  }, []);

  // 編集キャンセル処理
  const cancelEditing = useCallback(() => {
    setEditingIndex(null);
    setEditingRecord(null);
  }, []);

  return {
    // 状態
    userId,
    currentPassword,
    newPassword,
    showPasswordForm,
    theme,
    selectedDate,
    availableDates,
    dailyHistory,
    message,
    editingIndex,
    editingRecord,
    registrationDate,
    workoutDays,
    
    // アクション
    setCurrentPassword,
    setNewPassword,
    togglePasswordForm,
    handlePasswordChange,
    handleAccountDelete,
    handleLogout,
    confirmAndDeleteAccount,
    fetchInitialData,
    handleDateChange,
    handleEditRecord,
    handleSaveEdit,
    handleDeleteRecord,
    formatDateForDisplay,
    updateEditingRecord,
    cancelEditing,
    setMessage,
    setTheme
  };
};

export default useSetting;