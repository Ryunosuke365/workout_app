import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

// APIのベースURL（ユーザー設定関連）
const API_URL = "https://loadlog.jp/api/setting";

const useSetting = () => {
  // 認証系処理のカスタムフック
  const { handleAuthError, removeToken, authGet, authPut, authDelete } = useAuth();
  
  // 現在のパスワード
  const [currentPassword, setCurrentPassword] = useState("");

  // 新しいパスワード
  const [newPassword, setNewPassword] = useState("");

  // パスワード変更フォームの表示有無
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // 現在選択中の日付
  const [selectedDate, setSelectedDate] = useState("");

  // 履歴が存在する日付一覧
  const [availableDates, setAvailableDates] = useState([]);

  // 日次履歴データ
  const [dailyHistory, setDailyHistory] = useState([]);

  // 編集中の履歴Index
  const [editingIndex, setEditingIndex] = useState(null);

  // 編集中の履歴データ
  const [editingRecord, setEditingRecord] = useState(null);

  // 登録日
  const [registrationDate, setRegistrationDate] = useState("");

  // トレーニング実施日数
  const [workoutDays, setWorkoutDays] = useState(0);

  // ユーザーID（LocalStorageより取得）
  const [userId, setUserId] = useState("");

  // ユーザーへのメッセージ表示用
  const [message, setMessage] = useState("");

  /**
   * パスワードの変更処理
   */
  const handlePasswordChange = useCallback(async () => {
    try {
      const res = await authPut(`${API_URL}/account/password`, {
        currentPassword,
        newPassword,
      });
      setMessage(res.data.message || "パスワードを更新しました");
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      console.error("handlePasswordChange Error:", err);
      setMessage(err.response?.data?.error || "パスワード変更に失敗しました。");
    }
  }, [currentPassword, newPassword, authPut]);

  /**
   * アカウントの削除処理
   * @returns {boolean} 成功: true, 失敗: false
   */
  const handleAccountDelete = useCallback(async () => {
    try {
      await authDelete(`${API_URL}/account`);
      return true;
    } catch (err) {
      console.error("handleAccountDelete Error:", err);
      setMessage(err.response?.data?.error || "アカウント削除に失敗しました。");
      return false;
    }
  }, [authDelete]);

  /**
   * ユーザーの統計情報（登録日・トレーニング日数）の取得
   */
  const fetchUserStats = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/stats`);
      setRegistrationDate(res.data.registrationDate);
      setWorkoutDays(res.data.workoutDays);
    } catch (err) {
      console.error("fetchUserStats Error:", err);
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);

  /**
   * 日次履歴の取得
   * @param date 対象日付
   */
  const fetchDailyHistory = useCallback(
    async (date) => {
      try {
        const res = await authGet(`${API_URL}/daily?date=${date}`);
        setDailyHistory(res.data.dailyHistory ?? []);
      } catch (err) {
        console.error("fetchDailyHistory Error:", err);
        handleAuthError(err, setMessage);
      }
    },
    [authGet, handleAuthError]
  );

  /**
   * 履歴が存在する日付一覧の取得
   * 最初の日付の履歴も同時に取得
   */
  const fetchAvailableDates = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/dates`);
      const dates = res.data.dates ?? [];
      setAvailableDates(dates);

      if (dates.length > 0) {
        const firstDate = dates[0];
        setSelectedDate(firstDate);
        fetchDailyHistory(firstDate);
      }
    } catch (err) {
      console.error("fetchAvailableDates Error:", err);
      handleAuthError(err, setMessage);
    }
  }, [authGet, fetchDailyHistory, handleAuthError]);

  /**
   * 記録データの編集保存
   * @param index 編集対象のIndex
   */
  const handleSaveEdit = useCallback(
    async (index) => {
      try {
        const res = await authPut(`${API_URL}/records`, {
          record_id: editingRecord.id,
          weight: editingRecord.weight,
          reps: editingRecord.reps,
        });
        setMessage(res.data.message || "記録を更新しました。");

        const newHistory = [...dailyHistory];
        newHistory[index] = {
          ...editingRecord,
          total_load: editingRecord.weight * editingRecord.reps,
        };
        setDailyHistory(newHistory);

        setEditingIndex(null);
        setEditingRecord(null);
      } catch (err) {
        console.error("handleSaveEdit Error:", err);
        setMessage(err.response?.data?.error || "記録更新に失敗しました。");
      }
    },
    [editingRecord, dailyHistory, authPut]
  );

  /**
   * 記録データの削除
   * @param index 削除対象のIndex
   */
  const handleDeleteRecord = useCallback(
    async (index) => {
      try {
        const recordId = dailyHistory[index].id;
        const res = await authDelete(`${API_URL}/records/${recordId}`);
        setMessage(res.data.message || "記録を削除しました。");

        setDailyHistory(dailyHistory.filter((_, i) => i !== index));

        fetchUserStats();
      } catch (err) {
        console.error("handleDeleteRecord Error:", err);
        setMessage(err.response?.data?.error || "記録削除に失敗しました。");
      }
    },
    [dailyHistory, authDelete, fetchUserStats]
  );

  /**
   * 初期データの取得処理
   * ・ユーザーステータス
   * ・日付一覧
   * ・LocalStorageからのユーザーID取得
   */
  useEffect(() => {
    Promise.all([fetchUserStats(), fetchAvailableDates()]);
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id") || "");
    }
  }, [fetchUserStats, fetchAvailableDates]);

  return {
    // ステート
    userId,
    currentPassword,
    newPassword,
    showPasswordForm,
    selectedDate,
    availableDates,
    dailyHistory,
    editingIndex,
    editingRecord,
    registrationDate,
    workoutDays,
    message,

    // ステートのSetter
    setCurrentPassword,
    setNewPassword,
    setShowPasswordForm,
    setSelectedDate,
    setEditingIndex,
    setEditingRecord,
    setMessage,

    // 操作系関数
    handlePasswordChange,
    handleAccountDelete,
    handleSaveEdit,
    handleDeleteRecord,
    fetchDailyHistory,
    removeToken,
  };
};

export default useSetting;
