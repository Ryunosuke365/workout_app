import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";
const API_URL = "https://loadlog.jp/api/measure";

const useMeasure = () => {
  // 認証フックの利用
  const { handleAuthError, authGet, authPost, authDelete } = useAuth();
  
  // 状態管理
  const [category, setCategory] = useState("chest");
  const [exerciseName, setExerciseName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [exerciseData, setExerciseData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [totalLoad, setTotalLoad] = useState(0);
  const [dailyRecords, setDailyRecords] = useState([]);

  // 部位に応じた種目一覧を取得するAPI通信
  const fetchExercises = useCallback(async (selectedCategory) => {
    try {
      const response = await authGet(`${API_URL}/exercises/${selectedCategory}`);
      setExercises(response.data);
    } catch (err) {
      handleAuthError(err, setMessage, "⚠️ 種目一覧の取得に失敗しました");
    }
  }, [handleAuthError, authGet, setMessage]);

  // 今日の負荷データを取得するAPI通信
  const fetchDailyLoadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      // APIから負荷データを取得
      const response = await authGet(`${API_URL}/daily-load-summary`);
      
      setDailyRecords(response.data.records || []);
      setTotalLoad(response.data.totalLoad || 0);

      // サーバーエラーメッセージをクリア
      if (message && message.includes("サーバーエラー")) {
        setMessage("");
      }
    } catch (err) {
      // UIメッセージは表示しない（ユーザー体験を阻害しないため）
      handleAuthError(err, setMessage, "負荷データの取得に失敗しました", true);
    } finally {
      setIsLoading(false);
    }
  }, [authGet, handleAuthError, message, setMessage]);

  // 新しい種目を追加
  const handleAddExercise = useCallback(async () => {
    if (!exerciseName.trim()) return;
    
    try {
      await authPost(`${API_URL}/exercises`, { name: exerciseName, category });
      setExerciseName("");
      fetchExercises(category);
    } catch (err) {
      handleAuthError(err, setMessage, "⚠️ 種目の追加に失敗しました");
    }
  }, [category, exerciseName, fetchExercises, authPost, handleAuthError, setMessage]);

  // 筋トレ記録を送信するAPI通信処理
  const submitRecord = useCallback(async (exercise_id, weight, reps) => {
    setIsLoading(true);
    setMessage("");
    
    try {
      await authPost(API_URL, { 
        exercise_id, 
        weight: Number(weight), 
        reps: Number(reps) 
      });
      
      // 成功時の処理
      setMessage("✅ 記録しました！💪");
      setExerciseData(prev => ({
        ...prev,
        [exercise_id]: { weight: "", reps: "" }
      }));
      fetchDailyLoadSummary();
    } catch (err) {
      handleAuthError(err, setMessage, "⚠️ 記録の送信中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [authPost, handleAuthError, fetchDailyLoadSummary, setMessage]);

  // 種目を削除するAPI通信処理
  const deleteExercise = useCallback(async (exercise_id) => {
    try {
      await authDelete(`${API_URL}/${exercise_id}`);
      setMessage("✅ 種目を削除しました！");
      fetchExercises(category);
    } catch (err) {
      handleAuthError(err, setMessage, "⚠️ 種目の削除に失敗しました");
    }
  }, [category, fetchExercises, authDelete, handleAuthError, setMessage]);

  // 初期データ取得
  useEffect(() => {
    fetchExercises(category);
    fetchDailyLoadSummary();
  }, [category, fetchExercises, fetchDailyLoadSummary]);
  
  return {
    // 状態
    category,
    exerciseName,
    exercises,
    exerciseData,
    isLoading,
    message,
    totalLoad,
    dailyRecords,
    
    // UI操作のアクション
    handleAddExercise,
    submitRecord,
    deleteExercise,
    
    // セッター
    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage
  };
};

export default useMeasure; 