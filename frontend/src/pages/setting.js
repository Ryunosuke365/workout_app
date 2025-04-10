// SettingPage.js
import React from "react";
import styles from "@/styles/setting.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useSetting from "@/hooks/useSetting";
import { useRouter } from "next/router";

const SettingPage = () => {
  const router = useRouter();

  const {
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
    setCurrentPassword,
    setNewPassword,
    setShowPasswordForm,
    handlePasswordChange,
    handleAccountDelete,
    removeToken,
    fetchDailyHistory,
    setSelectedDate,
    handleSaveEdit,
    handleDeleteRecord,
    setEditingIndex,
    setEditingRecord,
    setMessage,
  } = useSetting();

  const isClient = typeof window !== 'undefined';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>設定</h1>
        <HamburgerMenu />
      </div>

      {message && (
        <div className={styles.message} onClick={() => setMessage("")}>{message}</div>
      )}

      <div className={styles.accountContainer}>
        <h2>アカウント情報</h2>
        <div className={styles.spacer}></div>
        <div className={styles.spacer}></div>

        <div className={styles.column}>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>ユーザーID:</span>
            <span>{isClient && localStorage.getItem("user_id") || "取得中..."}</span>
          </p>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>パスワード:</span>
            <span>
              ********
              <button
                className={styles.ChangeButton}
                onClick={() => setShowPasswordForm(prev => !prev)}
              >
                {showPasswordForm ? "閉じる" : "変更"}
              </button>
            </span>
          </p>

          {showPasswordForm && (
            <div className={styles.passwordChangeBox}>
              <input
                type="password"
                placeholder="現在のパスワード"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="新しいパスワード"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={handlePasswordChange}>変更する</button>
            </div>
          )}
        </div>

        <div className={styles.column}>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>登録日:</span>
            <span>{registrationDate || "取得中..."}</span>
          </p>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>筋トレ日数:</span>
            <span>{workoutDays != null ? `${workoutDays} 日` : "取得中..."}</span>
          </p>
        </div>

        <div className={styles.column}>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.actionButton} ${styles.logoutButton}`}
              onClick={() => {
                removeToken();
                router.push("/login");
              }}
            >
              ログアウト
            </button>
            <button
              className={`${styles.actionButton} ${styles.dangerButton}`}
              onClick={async () => {
                if (confirm("本当にアカウントを削除してよろしいですか？この操作は取り消せません。")) {
                  if (confirm("アカウントを削除すると、すべてのデータが完全に削除されます。\n本当に削除してよろしいですか？")) {
                    const success = await handleAccountDelete();
                    if (success) {
                      removeToken();
                      router.push("/register");
                    }
                  }
                }
              }}
            >
              アカウント削除
            </button>
          </div>
        </div>
      </div>

      {/* 他の部分（履歴など）は省略：変化なし */}
    </div>
  );
};

export default SettingPage;
