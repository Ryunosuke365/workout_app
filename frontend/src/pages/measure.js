import React from "react";
import styles from "@/styles/measure.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useMeasure from "@/hooks/useMeasure";

/**
 * 負荷量計測画面
 * ・部位/種目の登録
 * ・各種目の重量・回数記録
 * ・1日の合計負荷量の確認
 */
const MeasurePage = () => {
  const {
    category,            // 選択中の部位
    exerciseName,        // 入力中の種目名
    exercises,           // 登録済み種目一覧
    exerciseData,        // 入力中の重量・回数
    dailyRecords,        // 当日の記録一覧
    totalLoad,           // 当日の合計負荷
    message,             // メッセージ表示用
    isLoading,           // ローディング状態

    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage,

    handleAddExercise,   // 種目追加処理
    handleSubmitRecord,  // 記録送信処理
    handleDeleteExercise // 種目削除処理
  } = useMeasure();

  return (
    <div className={styles.pageContainer}>
      {/* ヘッダー */}
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>総負荷量計測</h1>
        <HamburgerMenu />
      </div>

      {/* メインコンテンツ */}
      <div className={styles.contentContainer}>
        {/* 左側：登録・入力・記録 */}
        <div className={styles.leftColumn}>
          <div className={styles.topRowContainer}>
            {/* 部位選択 */}
            <div className={`${styles.PartRegister} ${styles.BoxContainer}`}>
              <h2>部位を選択</h2>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.PartDropdown}
              >
                <option value="chest">胸</option>
                <option value="shoulders">肩</option>
                <option value="back">背中</option>
                <option value="arms">腕</option>
                <option value="legs">脚</option>
              </select>
            </div>

            {/* 種目追加 */}
            <div className={`${styles.EventRegister} ${styles.BoxContainer}`}>
              <h2>種目を登録</h2>
              <div className={styles.EventForm}>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="新しい種目名を入力"
                  className={styles.EventInput}
                />
                <button
                  onClick={handleAddExercise}
                  className={styles.EventButton}
                >
                  追加
                </button>
              </div>
            </div>
          </div>

          {/* 種目一覧・入力・記録 */}
          <div className={styles.ExerciseContainer}>
            <h2>登録済みの種目</h2>

            {message && <p className={styles.message}>{message}</p>}

            <table className={styles.ExerciseTable}>
              <thead>
                <tr>
                  <th>種目</th>
                  <th>重量 (kg)</th>
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
                      <td>{exercise.name}</td>
                      <td>
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) =>
                            setExerciseData((prev) => ({
                              ...prev,
                              [exercise.id]: {
                                ...prev[exercise.id],
                                weight: e.target.value,
                              },
                            }))
                          }
                          className={styles.ExerciseInput}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) =>
                            setExerciseData((prev) => ({
                              ...prev,
                              [exercise.id]: {
                                ...prev[exercise.id],
                                reps: e.target.value,
                              },
                            }))
                          }
                          className={styles.ExerciseInput}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            // 入力チェック
                            if (!weight || !reps) {
                              setMessage("⚠️ 重量と回数を入力してください！");
                              return;
                            }
                            handleSubmitRecord(exercise.id, weight, reps);
                          }}
                          className={styles.recordButton}
                          disabled={isLoading}
                        >
                          記録する
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            // 2段階確認ダイアログ
                            if (typeof window !== "undefined") {
                              const firstConfirm = window.confirm(
                                "本当にこの種目を削除してよろしいですか？この種目で行ってきた履歴も消えてしまいます。"
                              );
                              if (!firstConfirm) return;
                              const secondConfirm = window.confirm(
                                "この操作は取り消せません。本当に削除してよろしいですか？"
                              );
                              if (!secondConfirm) return;
                            }
                            handleDeleteExercise(exercise.id);
                          }}
                          className={styles.deleteButton}
                        >
                          削除する
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右側：今日の記録と合計 */}
        <div className={styles.rightColumn}>
          <h2 className={styles.TodayMuscleValue}>今日の記録</h2>
          <p className={styles.totalMuscleValue}>
            総負荷量: <span>{totalLoad}</span> kg
          </p>

          <table className={styles.MuscleTable}>
            <thead>
              <tr>
                <th>部位</th>
                <th>種目</th>
                <th>重量 (kg)</th>
                <th>回数</th>
                <th>負荷</th>
              </tr>
            </thead>
            <tbody>
              {dailyRecords.map((record, idx) => (
                <tr key={idx}>
                  <td>{record.category}</td>
                  <td>{record.name}</td>
                  <td>{record.weight}</td>
                  <td>{record.reps}</td>
                  <td>{record.total_load}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MeasurePage;
