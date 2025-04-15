import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

// APIのベースURL（負荷管理機能用）
const API_URL = "https://loadlog.jp/api/measure";

const useMeasure = () => {
  // 認証系処理のカスタムフック
  const { handleAuthError, authGet, authPost, authDelete } = useAuth();

  // 種目カテゴリー（例：胸、背中など）
  const [category, setCategory] = useState("chest");

  // 追加する種目名
  const [exerciseName, setExerciseName] = useState(""); 

  // 現在選択中カテゴリーに紐づく種目一覧
  const [exercises, setExercises] = useState([]);

  // 入力中の各種目データ（weight, reps）
  const [exerciseData, setExerciseData] = useState({});

  // 1日の記録一覧
  const [dailyRecords, setDailyRecords] = useState([]);

  // 1日の合計負荷
  const [totalLoad, setTotalLoad] = useState(0);

  // ユーザーへのメッセージ表示用
  const [message, setMessage] = useState("");

  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);

  /**
   * カテゴリーに紐づく種目一覧を取得
   */
  const fetchExercises = useCallback(
    async (selectedCategory) => {
      try {
        const res = await authGet(`${API_URL}/exercises/${selectedCategory}`);
        // データが存在しない場合は空配列をセット
        setExercises(res.data ?? []);
      } catch (err) {
        console.error("fetchExercises Error:", err);
        handleAuthError(err, setMessage, "種目一覧の取得に失敗しました");
      }
    },
    [authGet, handleAuthError, setMessage]
  );

  /**
   * 1日の記録サマリー（記録一覧 & 合計負荷）を取得
   */
  const fetchDailySummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authGet(`${API_URL}/daily-load-summary`);
      setDailyRecords(res.data.records ?? []);
      setTotalLoad(res.data.totalLoad ?? 0);
    } catch (err) {
      console.error("fetchDailySummary Error:", err);
      handleAuthError(err, setMessage, "負荷データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [authGet, handleAuthError, setMessage]);

  /**
   * 新規種目を追加
   */
  const handleAddExercise = useCallback(
    async () => {
      // 空白のみの入力は無視
      if (!exerciseName.trim()) return;

      try {
        await authPost(`${API_URL}/exercises`, {
          name: exerciseName,
          category,
        });
        setExerciseName("");
        fetchExercises(category);
      } catch (err) {
        console.error("handleAddExercise Error:", err);
        handleAuthError(err, setMessage, "種目の追加に失敗しました");
      }
    },
    [authPost, handleAuthError, exerciseName, category, fetchExercises, setMessage]
  );

  /**
   * 種目の記録を送信
   * @param exercise_id 対象種目ID
   * @param weight 重量
   * @param reps 回数
   */
  const handleSubmitRecord = useCallback(
    async (exercise_id, weight, reps) => {
      setIsLoading(true);
      try {
        const numericWeight = Number(weight);
        const numericReps = Number(reps);

        await authPost(API_URL, {
          exercise_id,
          weight: numericWeight,
          reps: numericReps,
        });

        // 入力フィールドをリセット
        setExerciseData((prev) => ({
          ...prev,
          [exercise_id]: { weight: "", reps: "" },
        }));

        fetchDailySummary();
      } catch (err) {
        console.error("handleSubmitRecord Error:", err);
        handleAuthError(err, setMessage, "記録の送信に失敗しました");
      } finally {
        setIsLoading(false);
      }
    },
    [authPost, handleAuthError, fetchDailySummary, setMessage]
  );

  /**
   * 種目の削除
   * @param exercise_id 対象種目ID
   */
  const handleDeleteExercise = useCallback(
    async (exercise_id) => {
      try {
        await authDelete(`${API_URL}/${exercise_id}`);
        fetchExercises(category);
        fetchDailySummary();
      } catch (err) {
        console.error("handleDeleteExercise Error:", err);
        handleAuthError(err, setMessage, "種目の削除に失敗しました");
      }
    },
    [authDelete, handleAuthError, category, fetchExercises, fetchDailySummary, setMessage]
  );

  /**
   * 初期表示 & category変更時のデータ取得処理
   */
  useEffect(() => {
    fetchExercises(category);
    fetchDailySummary();
  }, [category, fetchExercises, fetchDailySummary]);

  return {
    // ステート
    category,
    exerciseName,
    exercises,
    exerciseData,
    dailyRecords,
    totalLoad,
    message,
    isLoading,

    // ステートのSetter
    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage,

    // 操作系関数
    handleAddExercise,
    handleSubmitRecord,
    handleDeleteExercise,
  };
};

export default useMeasure;
