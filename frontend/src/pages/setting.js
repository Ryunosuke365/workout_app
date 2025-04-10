import React from "react";
import styles from "@/styles/setting.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useSetting from "@/hooks/useSetting";
import { useRouter } from "next/router";

const SettingPage = () => {
  const router = useRouter();
  
  const {
    // 状態
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
    
    // アクション
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

  return (
    <div className={styles.pageContainer}>
      {/* ヘッダー */}
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>設定</h1>
        <HamburgerMenu />
      </div>
      
      {/* メッセージ表示 */}
      {message && (
        <div className={styles.message} onClick={() => setMessage("")}>
          {message}
        </div>
      )}
      
      {/* アカウント情報：2行×3列グリッド */}
      <div className={styles.accountContainer}>
        <h2>アカウント情報</h2>
        {/* 空白 */}
        <div className={styles.spacer}></div>
        <div className={styles.spacer}></div>

        {/* 左列：ユーザーID・パスワード */}
        <div className={styles.column}>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>ユーザーID:</span>
            <span>
              {typeof window !== 'undefined' && localStorage.getItem("user_id")
                ? localStorage.getItem("user_id")
                : "取得中..."}
            </span>
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

        {/* 中央列：登録情報（登録日・筋トレ日数） */}
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

        {/* 右列：ログアウト & アカウント削除 */}
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
              onClick={() => {
                // 1段階目の確認
                const firstConfirm = window.confirm(
                  "本当にアカウントを削除してよろしいですか？この操作は取り消せません。"
                );
                if (!firstConfirm) return;

                // 2段階目の確認
                const secondConfirm = window.confirm(
                  "アカウントを削除すると、すべてのデータが完全に削除されます。\n本当に削除してよろしいですか？"
                );
                if (!secondConfirm) return;

                const success = handleAccountDelete();
                if (success) {
                  removeToken();
                  router.push("/register");
                }
              }}
            >
              アカウント削除
            </button>
          </div>
        </div>
      </div>

      {/* 日付選択と履歴編集・削除 */}
      <div className={styles.historyEditContainer}>
        <div className={styles.historyHeader}>
          <h2 className={styles.historyTitle}>日付ごとの履歴</h2>
          <select
            className={styles.dateSelect}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              fetchDailyHistory(e.target.value);
            }}
            value={selectedDate}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {(() => {
                  const date2 = new Date(date);
                  return date2.toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                })()}
              </option>
            ))}
          </select>
        </div>
        {dailyHistory.length > 0 ? (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>部位</th>
                <th>種目</th>
                <th>重量</th>
                <th>回数</th>
                <th>負荷</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {dailyHistory.map((item, index) =>
                editingIndex === index ? (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>
                      <input
                        type="number"
                        value={editingRecord.weight}
                        onChange={(e) => setEditingRecord(prev => ({
                          ...prev,
                          weight: Number(e.target.value)
                        }))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingRecord.reps}
                        onChange={(e) => setEditingRecord(prev => ({
                          ...prev,
                          reps: Number(e.target.value)
                        }))}
                      />
                    </td>
                    <td>{editingRecord.weight * editingRecord.reps}</td>
                    <td>
                      <div className={styles.buttonGroup}>
                        <button
                          className={`${styles.buttonModern} ${styles.saveButton}`}
                          onClick={() => handleSaveEdit(index)}
                        >
                          保存
                        </button>
                        <button
                          className={`${styles.buttonModern} ${styles.cancelButton}`}
                          onClick={() => {
                            setEditingIndex(null);
                            setEditingRecord(null);
                          }}
                        >
                          キャンセル
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>{item.weight}</td>
                    <td>{item.reps}</td>
                    <td>{item.total_load}</td>
                    <td>
                      <div className={styles.buttonGroup}>
                        <button
                          className={`${styles.buttonModern} ${styles.editButton}`}
                          onClick={() => {
                            setEditingIndex(index);
                            setEditingRecord({ ...dailyHistory[index] });
                          }}
                        >
                          編集
                        </button>
                        <button
                          className={`${styles.buttonModern} ${styles.deleteButton}`}
                          onClick={() => {
                            if (confirm("この記録を削除しますか？")) {
                              handleDeleteRecord(index);
                            }
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        ) : (
          <p className={styles.noDataMessage}>この日には記録がありません。</p>
        )}
      </div>
    </div>
  );
};

export default SettingPage;
