import styles from "@/styles/measure.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useMeasure     from "@/hooks/useMeasure";

// 負荷量計測ページのコンポーネント
// 部位選択、種目登録、重量・回数の記録、1日の合計負荷量の確認機能を提供
const MeasurePage = () => {
  // useMeasureフックから状態と関数を取得
  const {
    category,
    exerciseName,
    exercises,
    exerciseData,
    dailyRecords,
    totalLoad,
    message,
    isLoading, // isLoadingも追加 (ボタンのdisabled等で利用想定)

    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage,

    handleAddExercise,
    handleSubmitRecord,
    handleDeleteExercise,
  } = useMeasure();

  // 重量・回数入力の変更をハンドルする関数を動的に生成
  // exerciseId: 対象の種目ID
  // key: "weight" または "reps"
  const handleInputChange = (exerciseId, key) => (e) => {
    const value = e.target.value;
    // exerciseData stateを更新
    setExerciseData((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [key]: value,
      },
    }));
  };

  return (
    <div className="pageContainer">
      {/* ヘッダーセクション */}
      <header className="headerContainer">
        <h1 className="headerTitle">総負荷量計測</h1>
        <HamburgerMenu />
      </header>

      {/* メインコンテンツエリア (2カラムレイアウト) */}
      <div className="rowContainer">
        {/* 左カラム: 部位選択、種目登録、記録入力 */}
        <div className={styles.left}>
          {/* 上段: 部位選択と種目登録 */}
          <div className={styles.topRow}>
            {/* 部位選択セクション */}
            <section className="card">
              <h2 className="section-header">部位を選択</h2>
              <select
                className="form-control"
                value={category} // 現在選択中のカテゴリ
                onChange={(e) => setCategory(e.target.value)} // 選択変更時にカテゴリを更新
              >
                <option value="chest">胸</option>
                <option value="shoulders">肩</option>
                <option value="back">背中</option>
                <option value="arms">腕</option>
                <option value="legs">脚</option>
              </select>
            </section>

            {/* 種目登録セクション */}
            <section className="card">
              <h2 className="section-header">種目を登録</h2>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="新しい種目名を入力"
                  value={exerciseName} // 入力中の新しい種目名
                  onChange={(e) => setExerciseName(e.target.value)} // 入力変更時に種目名を更新
                />
                <button
                  className="btn btn--primary"
                  onClick={handleAddExercise} // クリックで種目追加処理を実行
                >
                  追加
                </button>
              </div>
            </section>
          </div>

          {/* 種目一覧・記録入力セクション */}
          <section className="card">
            <h2 className="section-header">登録済みの種目</h2>

            {/* メッセージ表示エリア */}
            {message && <p className="alert alert--warn">{message}</p>}

            <table className="table">
              <thead>
                <tr>
                  <th>種目</th>
                  <th>重量</th>
                  <th>回数</th>
                  <th>記録</th>
                  <th>削除</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => {
                  // 各エクササイズの入力値 (weight, reps) を取得、なければ空文字
                  const { weight = "", reps = "" } =
                    exerciseData[exercise.id] || {};
                  return (
                    <tr key={exercise.id}>
                      <td>
                        <div className={styles.exerciseNameContainer}>
                          {exercise.name} {/* 種目名 */}
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={weight} // 重量入力値
                          onChange={handleInputChange(exercise.id, "weight")} // 入力変更をハンドル
                          className={`form-control ${styles.inputMini}`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={reps} // 回数入力値
                          onChange={handleInputChange(exercise.id, "reps")} // 入力変更をハンドル
                          className={`form-control ${styles.inputMini}`}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn--success"
                          disabled={isLoading} // ローディング中は無効化
                          onClick={() => {
                            // 重量または回数が未入力の場合は警告メッセージを表示
                            if (!weight || !reps) {
                              setMessage("⚠️ 重量と回数を入力してください！");
                              return;
                            }
                            handleSubmitRecord(exercise.id, weight, reps); // 記録処理を実行
                          }}
                        >
                          記録
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn--danger"
                          onClick={() => {
                            // 削除確認ダイアログ (2段階)
                            if (typeof window !== "undefined") {
                              const first = window.confirm(
                                "本当にこの種目を削除してよろしいですか？\n履歴も全て消えます。"
                              );
                              if (!first) return;
                              const second = window.confirm(
                                "この操作は取り消せません。本当に削除しますか？"
                              );
                              if (!second) return;
                            }
                            handleDeleteExercise(exercise.id); // 削除処理を実行
                          }}
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>

        {/* 右カラム: 今日の記録 */}
        <section className={`card ${styles.right}`}>
          <h2 className="section-header">今日の記録</h2>

          <table className="table">
            <thead>
              <tr>
                <th>部位</th>
                <th>種目</th>
                <th>重量</th>
                <th>回数</th>
                <th>負荷</th>
              </tr>
            </thead>
            <tbody>
              {dailyRecords.map((record, idx) => (
                <tr key={idx}>
                  <td>{record.category}</td>
                  <td>
                    <div className={styles.recordExerciseContainer}>
                      {record.name}
                    </div>
                  </td>
                  <td>{record.weight}</td>
                  <td>{record.reps}</td>
                  <td>{record.total_load}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 総負荷量表示 */}
          <p style={{ marginTop: "20px", textAlign: "center" }}>
            総負荷量: <span>{totalLoad}</span> kg
          </p>
        </section>
      </div>
    </div>
  );
};

export default MeasurePage;