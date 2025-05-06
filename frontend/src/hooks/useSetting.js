import { useState, useCallback, useEffect } from "react";
import useAuth from "./useAuth";

const API_URL = "https://loadlog.jp/api/setting";

const useSetting = () => {
  const { handleAuthError, removeToken, authGet, authPut, authDelete } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [registrationDate, setRegistrationDate] = useState("");
  const [workoutDays, setWorkoutDays] = useState(0);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = useCallback(async () => {
    if (isLoading) return;

    if (!currentPassword || !newPassword) {
      setMessage("現在のパスワードと新しいパスワードを入力してください。");
      return;
    }

    const isValidNewPassword = (newPassword) =>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(newPassword);
    if(!isValidNewPassword(newPassword)) {
      setMessage("パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。")
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await authPut(`${API_URL}/account/password`, {
        currentPassword,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => {
        setMessage("");
      }, 3000);
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      handleAuthError(err, setMessage);
    }finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, authPut, handleAuthError, isLoading]);


  const fetchUserStats = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/stats`);
      setRegistrationDate(res.data.registrationDate);
      setWorkoutDays(res.data.workoutDays);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);

  
  const handleAccountDelete = useCallback(async (router) => {
    if (isLoading) return;

    if (!deletePassword) {
      setMessage("パスワードを入力してください。");
      return;
    }

    setIsLoading(true);

    try {
      await authDelete(`${API_URL}/account`, { data: { password: deletePassword } });
      removeToken();
      router.push("/register");
      return true;
    } catch (err) {
      handleAuthError(err, setMessage);
      setDeletePassword("");
      return false;
    }finally {
      setIsLoading(false);
    }
  }, [deletePassword, authDelete, removeToken, handleAuthError, isLoading]);


  const fetchDailyHistory = useCallback(async (date) => {
    try {
      const res = await authGet(`${API_URL}/daily?date=${date}`);
      setDailyHistory(res.data.dailyHistory ?? []);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);


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
      handleAuthError(err, setMessage);
    }
  }, [authGet, fetchDailyHistory, handleAuthError]);


  const handleSaveEdit = useCallback(async () => {
    const weight = typeof editingRecord.weight === 'string' ? 
      Number(editingRecord.weight) : editingRecord.weight;
    const reps = typeof editingRecord.reps === 'string' ? 
      Number(editingRecord.reps) : editingRecord.reps;
    
    if(!weight || !reps) {
      setMessage("重量と回数を入力してください");
      return;
    }

    try {
      await authPut(`${API_URL}/records`, {
        record_id: editingRecord.id,
        weight: weight,
        reps: reps,
      });

      fetchDailyHistory(selectedDate);

      setEditingIndex(null);
      setEditingRecord(null);
      setMessage("");
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [editingRecord, selectedDate, authPut, fetchDailyHistory, handleAuthError]);


  const handleDeleteRecord = useCallback(async (index) => {
    try {
      const record_id = dailyHistory[index].id;
      await authDelete(`${API_URL}/records/${record_id}`);
      
      setDailyHistory(dailyHistory.filter((_, i) => i !== index));

      fetchUserStats();
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [dailyHistory, authDelete, fetchUserStats, handleAuthError]);
  

  useEffect(() => {
    Promise.all([fetchUserStats(), fetchAvailableDates()]);
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
