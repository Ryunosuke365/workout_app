import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import useAuth from "./useAuth";

const API_URL = "http://3.112.2.147/api/setting";

const useSetting = () => {
  const router = useRouter();
  const { handleAuthError, removeToken, authGet, authPut, authDelete } = useAuth();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [deletePassword, setDeletePassword] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dailyHistory, setDailyHistory] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [registrationDate, setRegistrationDate] = useState<string>("");
  const [workoutDays, setWorkoutDays] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePasswordChange = useCallback(async () => {
    if (isLoading) return;
    if (!currentPassword || !newPassword) {
      setMessage("現在のパスワードと新しいパスワードを入力してください。");
      return;
    }
    const isValidNewPassword = (pwd: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(pwd);
    if (!isValidNewPassword(newPassword)) {
      setMessage("パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。");
      return;
    }
    setIsLoading(true);
    setMessage("");
    try {
      const res = await authPut(`${API_URL}/account/password`, { currentPassword, newPassword });
      setMessage(res.data.message);
      setTimeout(() => { setMessage(""); }, 3000);
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err: any) {
      handleAuthError(err, setMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, authPut, handleAuthError, isLoading]);

  const fetchUserStats = useCallback(async () => {
    try {
      const res = await authGet(`${API_URL}/stats`);
      setRegistrationDate(res.data.registrationDate);
      setWorkoutDays(res.data.workoutDays);
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, handleAuthError]);

  const handleAccountDelete = useCallback(async () => {
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
    } catch (err: any) {
      handleAuthError(err, setMessage);
      setDeletePassword("");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deletePassword, authDelete, removeToken, handleAuthError, isLoading, router]);

  const fetchDailyHistory = useCallback(async (date: string) => {
    try {
      const res = await authGet(`${API_URL}/daily?date=${date}`);
      setDailyHistory(res.data.dailyHistory ?? []);
    } catch (err: any) {
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
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [authGet, fetchDailyHistory, handleAuthError]);

  const handleSaveEdit = useCallback(async () => {
    const weight = typeof editingRecord.weight === 'string' ? Number(editingRecord.weight) : editingRecord.weight;
    const reps = typeof editingRecord.reps === 'string' ? Number(editingRecord.reps) : editingRecord.reps;
    if (!weight || !reps) {
      setMessage("重量と回数を入力してください");
      return;
    }
    try {
      await authPut(`${API_URL}/records`, { record_id: editingRecord.id, weight, reps });
      fetchDailyHistory(selectedDate);
      setEditingIndex(null);
      setEditingRecord(null);
      setMessage("");
    } catch (err: any) {
      handleAuthError(err, setMessage);
    }
  }, [editingRecord, selectedDate, authPut, fetchDailyHistory, handleAuthError]);

  const handleDeleteRecord = useCallback(async (index: number) => {
    try {
      const record_id = dailyHistory[index].id;
      await authDelete(`${API_URL}/records/${record_id}`);
      setDailyHistory(dailyHistory.filter((_, i) => i !== index));
      fetchUserStats();
    } catch (err: any) {
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