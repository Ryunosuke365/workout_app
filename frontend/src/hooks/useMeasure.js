import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

const API_URL = "https://loadlog.jp/api/measure";

const useMeasure = () => {
  const { handleAuthError, authGet, authPost, authDelete } = useAuth();

  const [category, setCategory] = useState("chest");
  const [exerciseName, setExerciseName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [exerciseData, setExerciseData] = useState({});
  const [dailyRecords, setDailyRecords] = useState([]);
  const [totalLoad, setTotalLoad] = useState(0);
  const [message, setMessage] = useState("");

  const fetchExercises = useCallback(async (selectedCategory) => {
    try {
      const res = await authGet(`${API_URL}/exercises/${selectedCategory}`);
      setExercises(res.data ?? []);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError, setMessage]);


  const fetchDailySummary = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/daily-load-summary`);
      setDailyRecords(res.data.records ?? []);
      setTotalLoad(res.data.totalLoad ?? 0);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError, setMessage]);


  const handleAddExercise = useCallback(async () => {
    if (!exerciseName.trim()) {
      setMessage("種目名を入力してください。")
      return;
    }

    try {
      await authPost(`${API_URL}/exercises`, {
        name: exerciseName,
        category,
      });
      setExerciseName("");
      fetchExercises(category);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [authPost, handleAuthError, exerciseName, category, fetchExercises, setMessage]);


  const handleDeleteExercise = useCallback(async (exercise_id) => {
    try {
      await authDelete(`${API_URL}/${exercise_id}`);
      fetchExercises(category);
      fetchDailySummary();
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  },[authDelete, handleAuthError, category, fetchExercises, fetchDailySummary, setMessage]);


  const handleSubmitRecord = useCallback(async (exercise_id, weight, reps) => {
    const numericWeight = typeof weight === 'string' ? Number(weight) : weight;
    const numericReps = typeof reps === 'string' ? Number(reps) : reps;
    
    if(!numericWeight || !numericReps) {
      setMessage("重量と回数を入力してください。")
      return;
    }

    try {
      await authPost(API_URL, {
        exercise_id,
        weight: numericWeight,
        reps: numericReps,
      });

      setExerciseData((prev) => ({
        ...prev,
        [exercise_id]: { weight: "", reps: "" },
      }));

      fetchDailySummary();
    } catch (err) {
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
