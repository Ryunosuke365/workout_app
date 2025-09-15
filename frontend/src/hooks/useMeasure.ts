import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

const API_URL = "http://3.112.2.147/api/measure";

const useMeasure = () => {
  const { handleAuthError, authGet, authPost, authDelete } = useAuth();

  const [category, setCategory] = useState<string>("chest");
  const [exerciseName, setExerciseName] = useState<string>("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [exerciseData, setExerciseData] = useState<Record<string, any>>({});
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);
  const [totalLoad, setTotalLoad] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  const fetchExercises = useCallback(async (selectedCategory: string) => {
    try {
      const res = await authGet(`${API_URL}/exercises/${selectedCategory}`);
      setExercises(res.data ?? []);
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError, setMessage]);

  const fetchDailySummary = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/daily-load-summary`);
      setDailyRecords(res.data.records ?? []);
      setTotalLoad(res.data.totalLoad ?? 0);
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError, setMessage]);

  const handleAddExercise = useCallback(async () => {
    if (!exerciseName.trim()) {
      setMessage("種目名を入力してください。");
      return;
    }
    try {
      await authPost(`${API_URL}/exercises`, { name: exerciseName, category });
      setExerciseName("");
      fetchExercises(category);
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authPost, handleAuthError, exerciseName, category, fetchExercises, setMessage]);

  const handleDeleteExercise = useCallback(async (exercise_id: number | string) => {
    try {
      await authDelete(`${API_URL}/${exercise_id}`);
      fetchExercises(category);
      fetchDailySummary();
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authDelete, handleAuthError, category, fetchExercises, fetchDailySummary, setMessage]);

  const handleSubmitRecord = useCallback(async (exercise_id: number | string, weight: number | string, reps: number | string) => {
    const numericWeight = typeof weight === 'string' ? Number(weight) : weight;
    const numericReps = typeof reps === 'string' ? Number(reps) : reps;
    if (!numericWeight || !numericReps) {
      setMessage("重量と回数を入力してください。");
      return;
    }
    try {
      await authPost(API_URL, { exercise_id, weight: numericWeight, reps: numericReps });
      setExerciseData((prev) => ({ ...prev, [exercise_id as any]: { weight: "", reps: "" } }));
      fetchDailySummary();
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authPost, handleAuthError, fetchDailySummary, setMessage]);

  useEffect(() => {
    fetchExercises(category);
    fetchDailySummary();
  }, [category, fetchExercises, fetchDailySummary]);

  return {
    category,
    exerciseName,
    exercises,
    exerciseData,
    dailyRecords,
    totalLoad,
    message,

    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage,

    handleAddExercise,
    handleSubmitRecord,
    handleDeleteExercise,
  };
};

export default useMeasure;