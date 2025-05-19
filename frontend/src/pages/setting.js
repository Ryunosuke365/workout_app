import { useRouter } from "next/router";
import styles  from "@/styles/setting.module.css";
import HamburgerMenu  from "@/components/HamburgerMenu";
import useSetting     from "@/hooks/useSetting";

// 設定ページのコンポーネント
// アカウント情報確認、パスワード変更、ログアウト、アカウント削除、過去履歴の編集・削除機能を提供
export default function SettingPage() {
  const router = useRouter(); // useRouterフックでrouterオブジェクトを取得 (ページ遷移に使用)

  // useSettingフックから状態と関数を取得
  const {
    userId,             // ユーザーID
    registrationDate,   // 登録日
    workoutDays,        // トレーニング実施日数
    currentPassword,    // 現在のパスワード入力値
    newPassword,        // 新しいパスワード入力値
    showPasswordForm,   // パスワード変更フォームの表示状態
    deleteConfirmation, // アカウント削除確認フォームの表示状態
    deletePassword,     // アカウント削除時のパスワード入力値
    selectedDate,       // 履歴編集で選択中の日付
    availableDates,     // 履歴が存在する日付のリスト
    dailyHistory,       // 選択日の履歴データ
    editingIndex,       // 編集中の履歴アイテムのインデックス
    editingRecord,      // 編集中の履歴アイテムのデータ
    message,            // ユーザーへのメッセージ
    isLoading,          // 汎用のisLoadingを受け取る

    setMessage,            // メッセージを更新する関数
    setCurrentPassword,    // 現在のパスワード入力値を更新する関数
    setNewPassword,        // 新しいパスワード入力値を更新する関数
    setShowPasswordForm,   // パスワード変更フォームの表示/非表示を切り替える関数
    setDeleteConfirmation, // アカウント削除確認フォームの表示/非表示を切り替える関数
    setDeletePassword,     // アカウント削除時のパスワード入力値を更新する関数
    setSelectedDate,       // 履歴編集の選択日付を更新する関数
    setEditingIndex,       // 編集中のインデックスを更新する関数
    setEditingRecord,      // 編集中のレコードデータを更新する関数

    removeToken,           // ローカルトークンを削除する関数 (ログアウト処理)
    handlePasswordChange,  // パスワード変更処理を実行する関数
    handleAccountDelete,   // アカウント削除処理を実行する関数
    fetchDailyHistory,     // 特定の日付の履歴を取得する関数
    handleSaveEdit,        // 編集内容を保存する関数
    handleDeleteRecord,    // 特定の履歴レコードを削除する関数
  } = useSetting();

  return (
    <div className="pageContainer">
      {/* ヘッダーセクション */}
      <header className="headerContainer">
        <h1 className="headerTitle">設定</h1>
        <HamburgerMenu />
      </header>

      {/* メッセージ表示エリア */}
      {message && <p className="alert alert--warn">{message}</p>}

      {/* アカウント情報ボードセクション */}
      <section className={`card ${styles.accountBoard}`}>

        <h2 style={{marginBottom:10,fontSize:20,color:"var(--clr-primary)"}}>アカウント情報</h2>

        {/* スペーサー (デザイン用) */}
        <div className={styles.spacer}></div>
        <div className={styles.spacer}></div>

        {/* 左カラム: ユーザーIDとパスワード変更 */}
        <div
          className={`${styles.column} ${
            showPasswordForm ? styles["column--open"] : "" // パスワードフォーム表示時にスタイルを適用
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
              onClick={() => setShowPasswordForm((prev) => !prev)} // クリックでパスワードフォームの表示/非表示をトグル
            >
              {showPasswordForm ? "閉じる" : "変更"}
            </button>
          </p>

          {/* パスワード変更フォーム (showPasswordFormがtrueの場合に表示) */}
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
                onClick={handlePasswordChange} // クリックでパスワード変更処理を実行
                disabled={isLoading} // 汎用isLoadingで無効化
              >
                {isLoading ? "処理中..." : "変更する"}
              </button>
            </div>
          )}
        </div>

        {/* 中央カラム: 登録日と筋トレ日数 */}
        <div className={styles.column}>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>登録日 :</span>
            <span>{registrationDate || "取得中..."}</span>
          </p>

          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>筋トレ日数 :</span>
            <span>
              {workoutDays != null ? `${workoutDays} 日` : "取得中..."} {/* workoutDaysがnullでない場合のみ表示 */}
            </span>
          </p>
        </div>

        {/* 右カラム: ログアウトとアカウント削除 */}
        <div
          className={`${styles.column} ${
            deleteConfirmation ? styles["column--open"] : "" // アカウント削除フォーム表示時にスタイルを適用
          }`}
        >
          <button
            className="btn btn--success"
            style={{padding: "6px 27px"}}
            onClick={() => {
              // ログアウト確認
              const ok = window.confirm("本当にログアウトしますか？");
              if (ok) {
                removeToken(); // トークンを削除
                router.push("/login"); // ログインページへ遷移
              }
            }}
          >
            ログアウト
          </button>

          <button
            className="btn btn--danger"
            onClick={() => {
              // アカウント削除フォームの表示/非表示トグル
              if (deleteConfirmation) setDeletePassword(""); // フォームを閉じる場合はパスワード入力値をクリア
              setDeleteConfirmation((prev) => !prev);
            }}
          >
            {deleteConfirmation ? "閉じる" : "アカウント削除"}
          </button>

          {/* アカウント削除フォーム (deleteConfirmationがtrueの場合に表示) */}
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
                  // パスワード未入力チェック
                  if (!deletePassword) {
                    setMessage("パスワードを入力してください");
                    return;
                  }
                  
                  // アカウント削除確認 (2段階)
                  const c1 = window.confirm("本当にアカウントを削除しますか？");
                  if (!c1) {
                    setDeleteConfirmation(false); // フォームを閉じる
                    setDeletePassword(""); // パスワード入力値をクリア
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
                  handleAccountDelete(); // アカウント削除処理を実行
                }}
                disabled={isLoading} // 汎用isLoadingで無効化
              >
                {isLoading ? "処理中..." : "削除を実行する"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 日付別履歴編集テーブルセクション */}
      <section className={`card ${styles.historyBoard}`}>
        <div className={styles.historyHeader}>
          <h2 className="section-header">日付ごとの履歴</h2>
          {/* 日付選択ドロップダウン */}
          <select
            className={`form-control ${styles.dateSelect}`}
            value={selectedDate} // 現在選択中の日付
            onChange={(e) => {
              setSelectedDate(e.target.value); // 選択日付を更新
              fetchDailyHistory(e.target.value); // 選択された日付の履歴を再取得
            }}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {/* 日付を日本語形式で表示 */}
                {new Date(date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* 履歴編集テーブル */}
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
                editingIndex === index ? ( // 現在のアイテムが編集中か判定
                  // 編集モードの行
                  <tr key={item.id} className={styles.editingRow}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={editingRecord.weight} // 編集中の重量
                        onChange={(e) =>
                          setEditingRecord((prev) => ({
                            ...prev,
                            weight: // 空文字許容、数値に変換
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
                        value={editingRecord.reps} // 編集中の回数
                        onChange={(e) =>
                          setEditingRecord((prev) => ({
                            ...prev,
                            reps: // 空文字許容、数値に変換
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                      />
                    </td>
                    {/* 編集中も負荷量をリアルタイム計算して表示 */}
                    <td>{editingRecord.weight * editingRecord.reps}</td>
                    <td>
                      <div className={styles.buttonGroup}>
                        <button
                          className="btn btn--success"
                          onClick={handleSaveEdit} // クリックで保存処理を実行
                        >
                          保存
                        </button>
                        <button
                          className="btn btn--primary"
                          onClick={() => setEditingIndex(-1)} // クリックで編集キャンセル (editingIndexを無効な値に)
                        >
                          キャンセル
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // 表示モードの行
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
                            // 編集モードに移行
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
                            // 削除確認
                            const ok = window.confirm(
                              "本当にこの記録を削除しますか？"
                            );
                            if (ok) handleDeleteRecord(index); // OKなら削除処理を実行
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
          // 履歴がない場合の表示
          <p className="alert alert--info">この日には記録がありません</p>
        )}
      </section>
    </div>
  );
}
