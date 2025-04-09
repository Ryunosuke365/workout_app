import React from "react";
import styles from "@/styles/setting.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useSetting from "@/hooks/useSetting";

const SettingPage = () => {
  const {
    // 状態
    userId,
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
    togglePasswordForm,
    handlePasswordChange,
    handleLogout,
    confirmAndDeleteAccount,
    handleDateChange,
    handleEditRecord,
    handleSaveEdit,
    handleDeleteRecord,
    formatDateForDisplay,
    updateEditingRecord,
    cancelEditing,
  } = useSetting();

  return (
    <div className={styles.pageContainer}>
      {/* ヘッダー */}
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>設定</h1>
        <HamburgerMenu />
      </div>
      
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
            <span>{userId}</span>
          </p>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>パスワード:</span>
            <span>
              ********
              <button
                className={styles.ChangeButton}
                onClick={togglePasswordForm}
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
              onClick={handleLogout}
            >
              ログアウト
            </button>
            <button
              className={`${styles.actionButton} ${styles.dangerButton}`}
              onClick={confirmAndDeleteAccount}
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
            onChange={(e) => handleDateChange(e.target.value)}
            value={selectedDate}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {formatDateForDisplay(date)}
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
                        onChange={(e) => updateEditingRecord('weight', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingRecord.reps}
                        onChange={(e) => updateEditingRecord('reps', e.target.value)}
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
                          onClick={cancelEditing}
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
                          onClick={() => handleEditRecord(index)}
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
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default SettingPage;
