import { useRouter } from "next/router";
import styles  from "@/styles/setting.module.css";
import HamburgerMenu  from "@/components/HamburgerMenu";
import useSetting     from "@/hooks/useSetting";

/**
 * 設定画面
 * ・アカウント情報の確認・編集
 * ・パスワード変更
 * ・ログアウト・アカウント削除
 * ・過去の履歴の編集・削除
 */
export default function SettingPage() {
  const router = useRouter();

  const {
    userId,
    registrationDate,
    workoutDays,
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
    message,

    setMessage,
    setCurrentPassword,
    setNewPassword,
    setShowPasswordForm,
    setDeleteConfirmation,
    setDeletePassword,
    setSelectedDate,
    setEditingIndex,
    setEditingRecord,

    removeToken,
    handlePasswordChange,
    handleAccountDelete,
    fetchDailyHistory,
    handleSaveEdit,
    handleDeleteRecord,
  } = useSetting();

  return (
    <div className="pageContainer">
      {/* ───────── ヘッダー ───────── */}
      <header className="headerContainer">
        <h1 className="headerTitle">設定</h1>
        <HamburgerMenu />
      </header>

      {/* ───────── メッセージ ───────── */}
      {message && <p className="alert alert--warn">{message}</p>}

      {/* ───────── ① アカウント情報ボード ───────── */}
      <section className={`card ${styles.accountBoard}`}>

        <h2 style={{marginBottom:10,fontSize:20,color:"var(--clr-primary)"}}>アカウント情報</h2>

        {!isMobile && (
          <>
            <div className={styles.spacer}></div>
            <div className={styles.spacer}></div>
          </>
        )}

        {/* ===== 左カラム：ID・パスワード ===== */}
        <div
          className={`${styles.column} ${
            showPasswordForm ? styles["column--open"] : ""
          }`}
        >
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>ユーザーID :</span>
            <span>{userId || "取得中..."}</span>
          </p>

          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>パスワード :</span>
            <button
              className="btn btn--primary"
              style={{padding: "6px 12px"}}
              onClick={() => setShowPasswordForm((prev) => !prev)}
            >
              {showPasswordForm ? "閉じる" : "変更"}
            </button>
          </p>

          {/* --- パスワード変更フォーム --- */}
          {showPasswordForm && (
            <div className={styles.slideBox}>
              <p className={styles.warningText}>
                パスワードを変更するには入力してください
              </p>
              <input
                type="password"
                className="form-control"
                placeholder="現在のパスワード"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                className="form-control"
                placeholder="新しいパスワード"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                className="btn btn--primary"
                onClick={handlePasswordChange}
              >
                変更する
              </button>
            </div>
          )}
        </div>

        {/* ===== 中央カラム：登録日・筋トレ日数 ===== */}
        <div className={styles.column}>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>登録日 :</span>
            <span>{registrationDate || "取得中..."}</span>
          </p>

          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>筋トレ日数 :</span>
            <span>
              {workoutDays != null ? `${workoutDays} 日` : "取得中..."}
            </span>
          </p>
        </div>

        {/* ===== 右カラム：ログアウト・アカウント削除 ===== */}
        <div
          className={`${styles.column} ${
            deleteConfirmation ? styles["column--open"] : ""
          }`}
        >
          <button
            className="btn btn--success"
            style={{padding: "6px 27px"}}
            onClick={() => {
              const ok = window.confirm("本当にログアウトしますか？");
              if (ok) {
                removeToken();
                router.push("/login");
              }
            }}
          >
            ログアウト
          </button>

          <button
            className="btn btn--danger"
            onClick={() => {
              if (deleteConfirmation) setDeletePassword("");
              setDeleteConfirmation((prev) => !prev);
            }}
          >
            {deleteConfirmation ? "閉じる" : "アカウント削除"}
          </button>

          {/* --- アカウント削除フォーム --- */}
          {deleteConfirmation && (
            <div className={styles.slideBox}>
              <p className={styles.warningText}>
                削除を実行するにはパスワードを入力してください
              </p>
              <input
                type="password"
                className="form-control"
                placeholder="現在のパスワード"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <button
                className="btn btn--danger"
                onClick={() => {
                  if (!deletePassword) {
                    setMessage("パスワードを入力してください");
                    return;
                  }
                  const c1 = window.confirm("本当にアカウントを削除しますか？");
                  if (!c1) {
                    setDeleteConfirmation(false);
                    setDeletePassword("");
                    return;
                  }
                  const c2 = window.confirm(
                    "この操作は取り消せません。全データが削除されます。実行しますか？"
                  );
                  if (!c2) {
                    setDeleteConfirmation(false);
                    setDeletePassword("");
                    return;
                  }
                  handleAccountDelete(router);
                }}
              >
                削除を実行する
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ───────── ② 日付別履歴編集テーブル ───────── */}
      <section className={`card ${styles.historyBoard}`}>
        <div className={styles.historyHeader}>
          <h2 className="section-header">日付ごとの履歴</h2>
          <select
            className={`form-control ${styles.dateSelect}`}
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

        {/* ===== テーブル ===== */}
        {dailyHistory.length > 0 ? (
          <table className="table">
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
                  /* --- 編集モード --- */
                  <tr key={item.id} className={styles.editingRow}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={editingRecord.weight}
                        onChange={(e) =>
                          setEditingRecord((prev) => ({
                            ...prev,
                            weight:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={editingRecord.reps}
                        onChange={(e) =>
                          setEditingRecord((prev) => ({
                            ...prev,
                            reps:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                      />
                    </td>
                    <td>{editingRecord.weight * editingRecord.reps}</td>
                    <td>
                      <div className={styles.buttonGroup}>
                        <button
                          className="btn btn--success"
                          onClick={handleSaveEdit}
                        >
                          保存
                        </button>
                        <button
                          className="btn btn--primary"
                          onClick={() => setEditingIndex(-1)}
                        >
                          キャンセル
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* --- 表示モード --- */
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>{item.weight}</td>
                    <td>{item.reps}</td>
                    <td>{item.total_load}</td>
                    <td>
                      <div className={styles.buttonGroup}>
                        <button
                          className="btn btn--primary"
                          onClick={() => {
                            setEditingIndex(index);
                            setEditingRecord({
                              id: item.id,
                              weight: item.weight,
                              reps: item.reps,
                            });
                          }}
                        >
                          編集
                        </button>
                        <button
                          className="btn btn--danger"
                          onClick={() => {
                            const ok = window.confirm(
                              "本当にこの記録を削除しますか？"
                            );
                            if (ok) handleDeleteRecord(index);
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
          <p className="alert alert--info">この日には記録がありません</p>
        )}
      </section>
    </div>
  );
}
