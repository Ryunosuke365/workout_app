import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import useAuth from "./useAuth";

// APIのエンドポイントURL
const API_URL = "https://loadlog.jp/api/setting";

// 設定関連のロジックをまとめたカスタムフック
const useSetting = () => {
  const router = useRouter(); // useRouterフックでrouterオブジェクトを取得
  // 認証関連のカスタムフックを利用
  const { handleAuthError, removeToken, authGet, authPut, authDelete } = useAuth();

  // stateの定義
  const [currentPassword, setCurrentPassword] = useState(""); // 現在のパスワード入力値
  const [newPassword, setNewPassword] = useState(""); // 新しいパスワード入力値
  const [showPasswordForm, setShowPasswordForm] = useState(false); // パスワード変更フォームの表示状態
  const [deleteConfirmation, setDeleteConfirmation] = useState(false); // アカウント削除確認の表示状態
  const [deletePassword, setDeletePassword] = useState(""); // アカウント削除時のパスワード入力値
  const [selectedDate, setSelectedDate] = useState(""); // 履歴編集で選択されている日付
  const [availableDates, setAvailableDates] = useState([]); // 履歴が存在する日付のリスト
  const [dailyHistory, setDailyHistory] = useState([]); // 特定の日付の履歴データ (編集用)
  const [editingIndex, setEditingIndex] = useState(null); // 編集中の履歴のインデックス
  const [editingRecord, setEditingRecord] = useState(null); // 編集中の履歴データ
  const [registrationDate, setRegistrationDate] = useState(""); // ユーザー登録日
  const [workoutDays, setWorkoutDays] = useState(0); // トレーニング実施日数
  const [userId, setUserId] = useState(""); // ユーザーID
  const [message, setMessage] = useState(""); // ユーザーへのメッセージ
  const [isLoading, setIsLoading] = useState(false); // 汎用ローディング状態


  
  // パスワード変更処理
  const handlePasswordChange = useCallback(async () => {
    if (isLoading) return; // 汎用isLoadingでチェック

    // 入力チェック
    if (!currentPassword || !newPassword) {
      setMessage("現在のパスワードと新しいパスワードを入力してください。");
      return;
    }

    // 新しいパスワードの形式チェック
    const isValidNewPassword = (newPassword) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(newPassword);
    if (!isValidNewPassword(newPassword)) {
      setMessage("パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。");
      return;
    }

    setIsLoading(true); // 汎用isLoadingをtrueに
    setMessage(""); // メッセージをクリア

    try {
      const res = await authPut(`${API_URL}/account/password`, {
        currentPassword,
        newPassword,
      });
      setMessage(res.data.message); // 成功メッセージ表示
      // 3秒後にメッセージをクリア
      setTimeout(() => {
        setMessage("");
      }, 3000);
      setCurrentPassword(""); // 入力欄クリア
      setNewPassword("");
      setShowPasswordForm(false); // フォームを閉じる
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    } finally {
      setIsLoading(false); // 汎用isLoadingをfalseに
    }
  }, [currentPassword, newPassword, authPut, handleAuthError, isLoading]);



  // ユーザー統計情報 (登録日、ワークアウト日数) を取得
  const fetchUserStats = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/stats`);
      setRegistrationDate(res.data.registrationDate);
      setWorkoutDays(res.data.workoutDays);
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authGet, handleAuthError]);



  // アカウント削除処理
  const handleAccountDelete = useCallback(async () => {
    if (isLoading) return; // 汎用isLoadingでチェック

    // パスワード入力チェック
    if (!deletePassword) {
      setMessage("パスワードを入力してください。");
      return;
    }

    setIsLoading(true); // 汎用isLoadingをtrueに

    try {
      await authDelete(`${API_URL}/account`, { data: { password: deletePassword } });
      removeToken(); // ローカルストレージからトークン削除
      router.push("/register"); // 登録ページへリダイレクト
      return true; // 削除成功
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
      setDeletePassword(""); // パスワード入力欄クリア
      return false; // 削除失敗
    } finally {
      setIsLoading(false); // 汎用isLoadingをfalseに
    }
  }, [deletePassword, authDelete, removeToken, handleAuthError, isLoading, router]);



  // 特定の日付のトレーニング履歴を取得 (履歴編集用)
  const fetchDailyHistory = useCallback(async (date) => {
    try {
      const res = await authGet(`${API_URL}/daily?date=${date}`);
      setDailyHistory(res.data.dailyHistory ?? []); // APIからのレスポンス、なければ空配列
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authGet, handleAuthError]);



  // 履歴が存在する日付のリストを取得 (履歴編集用)
  const fetchAvailableDates = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/dates`);
      const dates = res.data.dates ?? []; // APIからのレスポンス、なければ空配列
      setAvailableDates(dates);

      // 日付リストがあれば最初の日付を選択し、その日の履歴を取得
      if (dates.length > 0) {
        const firstDate = dates[0];
        setSelectedDate(firstDate);
        fetchDailyHistory(firstDate);
      }
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authGet, fetchDailyHistory, handleAuthError]); // fetchDailyHistoryも依存配列に追加



  // 編集したトレーニング記録を保存
  const handleSaveEdit = useCallback(async () => {
    // 重量と回数を数値に変換
    const weight = typeof editingRecord.weight === 'string' ?
      Number(editingRecord.weight) : editingRecord.weight;
    const reps = typeof editingRecord.reps === 'string' ?
      Number(editingRecord.reps) : editingRecord.reps;

    // 入力チェック
    if (!weight || !reps) {
      setMessage("重量と回数を入力してください");
      return;
    }

    try {
      await authPut(`${API_URL}/records`, {
        record_id: editingRecord.id,
        weight: weight,
        reps: reps,
      });

      fetchDailyHistory(selectedDate); // 更新後の履歴を再取得

      // 編集状態をリセット
      setEditingIndex(null);
      setEditingRecord(null);
      setMessage(""); // メッセージをクリア
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [editingRecord, selectedDate, authPut, fetchDailyHistory, handleAuthError]);



  // トレーニング記録を削除
  const handleDeleteRecord = useCallback(async (index) => {
    try {
      const record_id = dailyHistory[index].id; // 削除対象のID取得
      await authDelete(`${API_URL}/records/${record_id}`);

      // 画面上の履歴リストからも削除
      setDailyHistory(dailyHistory.filter((_, i) => i !== index));

      fetchUserStats(); // ユーザー統計情報を更新 (トレーニング日数が変わるため)
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [dailyHistory, authDelete, fetchUserStats, handleAuthError]);



  // 副作用フック: 初期データの取得
  useEffect(() => {
    // ユーザー統計情報と利用可能な日付リストを並行して取得
    Promise.all([fetchUserStats(), fetchAvailableDates()]);
    // ローカルストレージからユーザーIDを取得 (クライアントサイドでのみ実行)
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id") || "");
    }
  }, [fetchUserStats, fetchAvailableDates]);

  return {
    userId,
    currentPassword,
    newPassword,
    showPasswordForm,
    deleteConfirmation,
    deletePassword,
    selectedDate,
    availableDates,
    dailyHistory,
    editingIndex,
    editingRecord,
    registrationDate,
    workoutDays,
    message,
    isLoading,

    setCurrentPassword,
    setNewPassword,
    setShowPasswordForm,
    setDeleteConfirmation,
    setDeletePassword,
    setSelectedDate,
    setEditingIndex,
    setEditingRecord,
    setMessage,

    handlePasswordChange,
    handleAccountDelete,
    handleSaveEdit,
    handleDeleteRecord,
    fetchDailyHistory,
    removeToken,
  };
};

export default useSetting;
