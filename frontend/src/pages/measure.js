import React from "react";
import styles from "@/styles/measure.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useMeasure from "@/hooks/useMeasure";

const MeasurePage = () => {
  const {
    // 状態
    category,
    exerciseName,
    exercises,
    exerciseData,
    isLoading,
    message,
    totalLoad,
    dailyRecords,
    
    // UI操作のアクション
    handleAddExercise,
    submitRecord,
    deleteExercise,
    
    // セッター
    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage
  } = useMeasure();
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>総負荷量計測</h1>
        <HamburgerMenu />
      </div>

      <div className={styles.contentContainer}>
        {/* 左カラム - 入力フォーム */}
        <div className={styles.leftColumn}>
          {/* 部位選択と種目登録 */}
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
            
            {/* 種目登録 */}
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

          {/* 登録済みの種目一覧 */}
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
                {exercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td>{exercise.name}</td>
                    <td>
                      <input
                        type="number"
                        value={exerciseData[exercise.id]?.weight || ""}
                        onChange={(e) => {
                          const { value } = e.target;
                          if (value === "" || isNaN(value) || Number(value) < 0) return;
                          setExerciseData(prev => ({
                            ...prev,
                            [exercise.id]: { ...prev[exercise.id], weight: value }
                          }));
                        }}
                        className={styles.ExerciseInput}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={exerciseData[exercise.id]?.reps || ""}
                        onChange={(e) => {
                          const { value } = e.target;
                          if (value === "" || isNaN(value) || Number(value) < 0) return;
                          setExerciseData(prev => ({
                            ...prev,
                            [exercise.id]: { ...prev[exercise.id], reps: value }
                          }));
                        }}
                        className={styles.ExerciseInput}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          const { weight, reps } = exerciseData[exercise.id] || {};
                          
                          // 入力値のバリデーション
                          if (!weight || !reps) {
                            setMessage("⚠️ 重量と回数を入力してください！");
                            return;
                          }
                          
                          // バリデーション通過後にAPI通信処理を実行
                          // 実際の処理を直接実行
                          submitRecord(exercise.id, weight, reps);
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
                          // 確認ダイアログ表示
                          if (typeof window !== 'undefined') {
                            const firstConfirm = window.confirm(
                              "本当にこの種目を削除してよろしいですか？この種目で行ってきた履歴も消えてしまいます。"
                            );
                            if (!firstConfirm) return;
                            const secondConfirm = window.confirm(
                              "この操作は取り消せません。本当に削除してよろしいですか？"
                            );
                            if (!secondConfirm) return;
                          }
                          // 確認が取れたらAPI通信処理を実行
                          deleteExercise(exercise.id);
                        }}
                        className={styles.deleteButton}
                      >
                        削除する
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右カラム - 今日の記録表示 */}
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
              {dailyRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.category}</td>
                  <td>{record.name}</td>
                  <td>{record.weight} kg</td>
                  <td>{record.reps} 回</td>
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
