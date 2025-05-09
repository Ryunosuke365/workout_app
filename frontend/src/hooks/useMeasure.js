import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

// APIのエンドポイントURL
const API_URL = "https://loadlog.jp/api/measure";

// 計測関連のロジックをまとめたカスタムフック
const useMeasure = () => {
  // 認証関連のカスタムフックを利用
  const { handleAuthError, authGet, authPost, authDelete } = useAuth();

  // stateの定義
  const [category, setCategory] = useState("chest"); // 選択中のトレーニングカテゴリ
  const [exerciseName, setExerciseName] = useState(""); // 新規追加する種目名
  const [exercises, setExercises] = useState([]); // 選択中カテゴリの種目リスト
  const [exerciseData, setExerciseData] = useState({}); // 各エクササイズの入力データ (重量、回数)
  const [dailyRecords, setDailyRecords] = useState([]); // 当日の記録サマリー
  const [totalLoad, setTotalLoad] = useState(0); // 当日の合計負荷
  const [message, setMessage] = useState(""); // ユーザーへのメッセージ

  // 指定されたカテゴリの種目リストを取得する関数
  const fetchExercises = useCallback(async (selectedCategory) => {
    try {
      const res = await authGet(`${API_URL}/exercises/${selectedCategory}`);
      setExercises(res.data ?? []); // APIからのレスポンス、なければ空配列
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authGet, handleAuthError, setMessage]); // setMessageも依存配列に追加 (エラー表示で利用するため)

  // 当日の記録サマリーと合計負荷を取得する関数
  const fetchDailySummary = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/daily-load-summary`);
      setDailyRecords(res.data.records ?? []); // 当日の記録
      setTotalLoad(res.data.totalLoad ?? 0); // 当日の合計負荷
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authGet, handleAuthError, setMessage]); // setMessageも依存配列に追加

  // 新しい種目を追加する関数
  const handleAddExercise = useCallback(async () => {
    // 種目名が空の場合はエラーメッセージを表示して処理を中断
    if (!exerciseName.trim()) {
      setMessage("種目名を入力してください。");
      return;
    }

    try {
      // APIに種目追加リクエストを送信
      await authPost(`${API_URL}/exercises`, {
        name: exerciseName,
        category,
      });
      setExerciseName(""); // 種目名入力欄をクリア
      fetchExercises(category); // 種目リストを再取得して更新
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authPost, handleAuthError, exerciseName, category, fetchExercises, setMessage]); // setMessageも依存配列に追加

  // 種目を削除する関数
  const handleDeleteExercise = useCallback(async (exercise_id) => {
    try {
      // APIに種目削除リクエストを送信
      await authDelete(`${API_URL}/${exercise_id}`);
      fetchExercises(category); // 種目リストを再取得
      fetchDailySummary(); // 当日のサマリーも再取得 (削除した種目の記録が影響する可能性があるため)
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authDelete, handleAuthError, category, fetchExercises, fetchDailySummary, setMessage]); // setMessageも依存配列に追加

  // トレーニング記録を登録する関数
  const handleSubmitRecord = useCallback(async (exercise_id, weight, reps) => {
    // 重量と回数を数値に変換 (文字列で渡ってくる場合があるため)
    const numericWeight = typeof weight === 'string' ? Number(weight) : weight;
    const numericReps = typeof reps === 'string' ? Number(reps) : reps;

    // 重量または回数が未入力、または0の場合はエラーメッセージを表示して処理を中断
    if (!numericWeight || !numericReps) {
      setMessage("重量と回数を入力してください。");
      return;
    }

    try {
      // APIに記録登録リクエストを送信
      await authPost(API_URL, {
        exercise_id,
        weight: numericWeight,
        reps: numericReps,
      });

      // 記録登録後、該当エクササイズの入力欄をクリア
      setExerciseData((prev) => ({
        ...prev,
        [exercise_id]: { weight: "", reps: "" }, // 対象のexercise_idのデータを初期化
      }));

      fetchDailySummary(); // 当日のサマリーを再取得して更新
    } catch (err) {
      handleAuthError(err, setMessage); // エラー処理
    }
  }, [authPost, handleAuthError, fetchDailySummary, setMessage]); // setMessageも依存配列に追加

  // コンポーネントのマウント時、またはカテゴリ変更時に種目リストと当日のサマリーを取得
  useEffect(() => {
    fetchExercises(category);
    fetchDailySummary();
    // category, fetchExercises, fetchDailySummary が変更された時に再実行
  }, [category, fetchExercises, fetchDailySummary]);

  // フックが提供する値と関数
  return {
    category,
    exerciseName,
    exercises,
    exerciseData,
    dailyRecords,
    totalLoad,
    message,

    // state更新関数
    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage,

    // イベントハンドラ関数
    handleAddExercise,
    handleSubmitRecord,
    handleDeleteExercise,
  };
};

export default useMeasure;
