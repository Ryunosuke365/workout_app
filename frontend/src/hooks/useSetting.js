import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import useAuth from "./useAuth";

// APIエンドポイントの定義
const API_URL = "https://loadlog.jp/api/setting";

const useSetting = () => {
  // ルーターの取得
  const router = useRouter();
  
  // 状態管理
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
  const [userId, setUserId] = useState("");

  // 認証フックの利用
  const { 
    handleAuthError, 
    removeToken,
    authGet,
    authPut,
    authDelete
  } = useAuth();

  // ユーザーIDの取得（クライアントサイドでのみ実行）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem("user_id") || "");
    }
  }, []);

  // パスワード変更処理
  const handlePasswordChange = useCallback(async () => {
    try {
      const response = await authPut(
        `${API_URL}/account/password`,
        { currentPassword, newPassword }
      );
      
      setMessage(response.data.message || "パスワードを更新しました");
      
      // 成功したらフォームをクリア
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "パスワード変更に失敗しました。");
    }
  }, [currentPassword, newPassword, authPut]);

  // アカウント削除処理
  const handleAccountDelete = useCallback(async () => {
    try {
      await authDelete(`${API_URL}/account`);
      return true; // 削除成功
    } catch (err) {
      setMessage(err.response?.data?.error || "アカウント削除に失敗しました。");
      return false; // 削除失敗
    }
  }, [authDelete]);

  // ユーザー統計情報の取得
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await authGet(`${API_URL}/stats`);
      setRegistrationDate(response.data.registrationDate);
      setWorkoutDays(response.data.workoutDays);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [authGet, handleAuthError]);

  // 選択日付の履歴取得
  const fetchDailyHistory = useCallback(async (dateStr) => {
    try {
      const response = await authGet(`${API_URL}/daily?date=${dateStr}`);
      setDailyHistory(response.data.dailyHistory ?? []);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [authGet, handleAuthError]);

  // 利用可能な日付の取得
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

  // 履歴編集保存
  const handleSaveEdit = useCallback(async (index) => {
    try {
      const response = await authPut(
        `${API_URL}/records/${editingRecord.id}`,
        {
          record_id: editingRecord.id,
          weight: editingRecord.weight,
          reps: editingRecord.reps,
        }
      );
      
      setMessage(response.data.message || "記録を更新しました。");
      const newHistory = [...dailyHistory];
      newHistory[index] = {
        ...editingRecord,
        total_load: editingRecord.weight * editingRecord.reps, // 負荷（重量×回数）
      };
      
      setDailyHistory(newHistory);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      setMessage(error.response?.data?.error || "記録更新に失敗しました。");
    }
  }, [dailyHistory, editingRecord, authPut]);

  // 履歴削除処理
  const handleDeleteRecord = useCallback(async (index) => {
    try {
      const recordId = dailyHistory[index].id;
      const response = await authDelete(`${API_URL}/records/${recordId}`);
      
      setMessage(response.data.message || "記録を削除しました。");
      setDailyHistory(dailyHistory.filter((_, i) => i !== index));
    } catch (error) {
      setMessage(error.response?.data?.error || "記録削除に失敗しました。");
    }
  }, [dailyHistory, authDelete]);

  // 初期データの取得
  const fetchInitialData = useCallback(async () => {
    await fetchUserStats();
    await fetchAvailableDates();
  }, [fetchUserStats, fetchAvailableDates]);

  // 初期データ取得を自動実行
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ログアウト処理
  const handleLogout = useCallback(() => {
    removeToken();
    router.push("/login");
  }, [removeToken, router]);

  // アカウント削除の確認処理
  const confirmAndDeleteAccount = useCallback(async () => {
    // 1段階目の確認
    const firstConfirm = window.confirm(
      "本当にアカウントを削除してよろしいですか？この操作は取り消せません。"
    );
    if (!firstConfirm) return;

    // 2段階目の確認
    const secondConfirm = window.confirm(
      "アカウントを削除すると、すべてのデータが完全に削除されます。\n本当に削除してよろしいですか？"
    );
    if (!secondConfirm) return;

    const success = await handleAccountDelete();
    if (success) {
      removeToken();
      router.push("/register");
    }
  }, [handleAccountDelete, removeToken, router]);

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
    handleDateChange,
    handleEditRecord,
    handleSaveEdit,
    handleDeleteRecord,
    formatDateForDisplay,
    updateEditingRecord,
    cancelEditing,
    setMessage
  };
};

export default useSetting;