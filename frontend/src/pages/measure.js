import stylesDesktop from "@/stylesDesktop/measure.module.css";
import stylesMobile  from "@/stylesMobile/measure.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useMeasure     from "@/hooks/useMeasure";
import useDeviceDetect from "@/hooks/useDeviceDetect";

/**
 * 負荷量計測画面
 * ・部位/種目の登録
 * ・各種目の重量・回数記録
 * ・1日の合計負荷量の確認
 */
const MeasurePage = () => {
  // デバイス検出とスタイルの選択にカスタムフックを使用
  const { isMobile, styles } = useDeviceDetect(stylesDesktop, stylesMobile);

  const {
    category,
    exerciseName,
    exercises,
    exerciseData,
    dailyRecords,
    totalLoad,
    message,
    isLoading,

    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage,

    handleAddExercise,
    handleSubmitRecord,
    handleDeleteExercise,
  } = useMeasure();

  // 入力ハンドラを動的生成
  const handleInputChange = (exerciseId, key) => (e) => {
    const value = e.target.value;
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
      {/* ───────── ヘッダー ───────── */}
      <header className="headerContainer">
        <h1 className="headerTitle">総負荷量計測</h1>
        <HamburgerMenu />
      </header>

      {/* ───────── メイン ───────── */}
      <div className="rowContainer">
        {/* ========== 左カラム ========== */}
        <div className={styles.left}>
          {/* ---- 部位選択 & 種目登録（上段２枚） ---- */}
          <div className={styles.topRow}>
            {/* 部位選択 */}
            <section className="card">
              <h2 className="section-header">部位を選択</h2>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="chest">胸</option>
                <option value="shoulders">肩</option>
                <option value="back">背中</option>
                <option value="arms">腕</option>
                <option value="legs">脚</option>
              </select>
            </section>

            {/* 種目登録 */}
            <section className="card">
              <h2 className="section-header">種目を登録</h2>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="新しい種目名を入力"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleAddExercise}
                >
                  追加
                </button>
              </div>
            </section>
          </div>

          {/* ---- 種目一覧・記録入力 ---- */}
          <section className="card">
            <h2 className="section-header">登録済みの種目</h2>

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
                  const { weight = "", reps = "" } =
                    exerciseData[exercise.id] || {};
                  return (
                    <tr key={exercise.id}>
                      <td>
                        <div className={styles.exerciseNameContainer}>
                          {exercise.name}
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={weight}
                          onChange={handleInputChange(exercise.id, "weight")}
                          className={`form-control ${styles.inputMini}`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={reps}
                          onChange={handleInputChange(exercise.id, "reps")}
                          className={`form-control ${styles.inputMini}`}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn--success"
                          disabled={isLoading}
                          onClick={() => {
                            if (!weight || !reps) {
                              setMessage("⚠️ 重量と回数を入力してください！");
                              return;
                            }
                            handleSubmitRecord(exercise.id, weight, reps);
                          }}
                        >
                          記録
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn--danger"
                          onClick={() => {
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
                            handleDeleteExercise(exercise.id);
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

        {/* ========== 右カラム：本日の記録 ========== */}
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

          <p style={{ marginTop: "20px", textAlign: "center" }}>
            総負荷量: <span>{totalLoad}</span> kg
          </p>
        </section>
      </div>
    </div>
  );
};

export default MeasurePage;