import React from "react";
import { useRouter } from "next/router";
import styles from "@/styles/setting.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useSetting from "@/hooks/useSetting";

/**
 * 設定画面
 * ・アカウント情報の確認・編集
 * ・パスワード変更
 * ・ログアウト・アカウント削除
 * ・過去の履歴の編集・削除
 */
const SettingPage = () => {
  const router = useRouter();

  const {
    userId,                // ユーザーID
    registrationDate,      // 登録日
    workoutDays,           // 筋トレ日数
    currentPassword,       // 現在のパスワード
    newPassword,           // 新しいパスワード
    showPasswordForm,      // パスワード変更フォーム表示状態
    deleteConfirmation,    // アカウント削除確認状態
    deletePassword,        // アカウント削除用パスワード
    selectedDate,          // 選択中の日付
    availableDates,        // 選択可能な日付一覧
    dailyHistory,          // 選択中の日の履歴一覧
    editingIndex,          // 編集中の履歴index
    editingRecord,         // 編集中の履歴データ
    message,               // メッセージ表示用
  
    setMessage,            // メッセージ更新処理
    setCurrentPassword,    // 現在のパスワード更新処理
    setNewPassword,        // 新しいパスワード更新処理
    setShowPasswordForm,   // パスワード変更フォーム表示切替処理
    setDeleteConfirmation,
    setDeletePassword,     // アカウント削除用パスワード更新処理
    setSelectedDate,       // 選択中の日付更新処理
    setEditingIndex,       // 編集中の履歴index更新処理
    setEditingRecord,      // 編集中の履歴データ更新処理
  
    removeToken,           // トークン削除処理
    handlePasswordChange,  // パスワード変更処理
    handleAccountDelete,   // アカウント削除実行処理
    fetchDailyHistory,     // 日次履歴取得処理
    handleSaveEdit,        // 履歴保存処理
    handleDeleteRecord,    // 履歴削除処理
  } = useSetting();
  
  return (
    <div className={styles.pageContainer}>
      {/* ヘッダー */}
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>設定</h1>
        <HamburgerMenu />
      </div>

      {/* メッセージ表示エリア */}
      {message && (
        <div className={styles.message} onClick={() => setMessage("")}>
          {message}
        </div>
      )}

      {/* アカウント情報エリア */}
      <div className={styles.accountContainer}>
        <h2>アカウント情報</h2>

        <div className={styles.spacer}></div>
        <div className={styles.spacer}></div>

        {/* 左カラム：IDとパスワード */}
        <div className={styles.column}>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>ユーザーID:</span>
            <span>{userId || "取得中..."}</span>
          </p>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>パスワード:</span>
            <span>
              ********
              <button
                className={styles.ChangeButton}
                onClick={() => setShowPasswordForm((prev) => !prev)}
              >
                {showPasswordForm ? "閉じる" : "変更"}
              </button>
            </span>
          </p>

          {/* パスワード変更フォーム */}
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

        {/* 中央カラム：登録日・筋トレ日数 */}
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

        {/* 右カラム：ログアウト・アカウント削除 */}
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
                if (!deleteConfirmation) {
                  const confirm1 = window.confirm("本当にアカウントを削除しますか？");
                  if (!confirm1) return;
                }
                setDeleteConfirmation((prev) => !prev);
              }}
            >
              {deleteConfirmation ? "閉じる" : "アカウント削除"}
            </button>

            {deleteConfirmation && (
              <div className={styles.passwordChangeBox}>
                <div className={styles.warningText}>
                  削除を実行するには現在のパスワードを入力してください
                </div>
                <input
                  type="password"
                  placeholder="現在のパスワード"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
                <button
                  className={styles.dangerButton}
                  onClick={() => {
                    if (!deletePassword) {
                      setMessage("パスワードを入力してください");
                      return;
                    }

                    const confirm2 = window.confirm(
                      "この操作は取り消せません。全データが消えます。\n\n本当にアカウントを削除しますか？"
                    );
                    if (!confirm2) return;

                    handleAccountDelete(router);
                  }}
                >
                  削除を実行する
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 履歴編集エリア */}
      <div className={styles.historyEditContainer}>
        <div className={styles.historyHeader}>
          <h2 className={styles.historyTitle}>日付ごとの履歴</h2>

          {/* 日付選択 */}
          <select
            className={styles.dateSelect}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              fetchDailyHistory(e.target.value);
            }}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* 履歴テーブル */}
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
                  // 編集モード
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>
                      <input
                        type="number"
                        value={editingRecord.weight}
                        onChange={(e) => setEditingRecord(prev => ({
                          ...prev,
                          weight: Number(e.target.value),
                        }))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingRecord.reps}
                        onChange={(e) => setEditingRecord(prev => ({
                          ...prev,
                          reps: Number(e.target.value),
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
                  // 通常表示モード
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
                            setEditingRecord({ ...item });
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
