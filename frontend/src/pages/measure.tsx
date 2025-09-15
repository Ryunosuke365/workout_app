import styles from "@/styles/measure.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useMeasure from "@/hooks/useMeasure";

const MeasurePage = () => {
  const {
    category,
    exerciseName,
    exercises,
    exerciseData,
    dailyRecords,
    totalLoad,
    message,
    setCategory,
    setExerciseName,
    setExerciseData,
    setMessage,
    handleAddExercise,
    handleSubmitRecord,
    handleDeleteExercise,
  } = useMeasure();

  const handleInputChange = (exerciseId: number, key: "weight" | "reps") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExerciseData((prev: any) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [key]: value,
      },
    }));
  };

  return (
    <div className="pageContainer">
      <header className="headerContainer">
        <h1 className="headerTitle">総負荷量計測</h1>
        <HamburgerMenu />
      </header>

      <div className="rowContainer">
        <div className={styles.left}>
          <div className={styles.topRow}>
            <section className="card">
              <h2 className="section-header">部位を選択</h2>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="chest">胸</option>
                <option value="shoulders">肩</option>
                <option value="back">背中</option>
                <option value="arms">腕</option>
                <option value="legs">脚</option>
              </select>
            </section>

            <section className="card">
              <h2 className="section-header">種目を登録</h2>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="新しい種目名を入力" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} />
                <button className="btn btn--primary" onClick={handleAddExercise}>追加</button>
              </div>
            </section>
          </div>

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
                {exercises.map((exercise: any) => {
                  const { weight = "", reps = "" } = (exerciseData as any)[exercise.id] || {};
                  return (
                    <tr key={exercise.id}>
                      <td>
                        <div className={styles.exerciseNameContainer}>{exercise.name}</div>
                      </td>
                      <td>
                        <input type="number" value={weight} onChange={handleInputChange(exercise.id, "weight")} className={`form-control ${styles.inputMini}`} />
                      </td>
                      <td>
                        <input type="number" value={reps} onChange={handleInputChange(exercise.id, "reps")} className={`form-control ${styles.inputMini}`} />
                      </td>
                      <td>
                        <button className="btn btn--success" onClick={() => {
                          if (!weight || !reps) {
                            setMessage("⚠️ 重量と回数を入力してください！");
                            return;
                          }
                          handleSubmitRecord(exercise.id, weight, reps);
                        }}>記録</button>
                      </td>
                      <td>
                        <button className="btn btn--danger" onClick={() => {
                          if (typeof window !== "undefined") {
                            const first = window.confirm("本当にこの種目を削除してよろしいですか？\n履歴も全て消えます。");
                            if (!first) return;
                            const second = window.confirm("この操作は取り消せません。本当に削除しますか？");
                            if (!second) return;
                          }
                          handleDeleteExercise(exercise.id);
                        }}>削除</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>

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
              {dailyRecords.map((record: any, idx: number) => (
                <tr key={idx}>
                  <td>{record.category}</td>
                  <td><div className={styles.recordExerciseContainer}>{record.name}</div></td>
                  <td>{record.weight}</td>
                  <td>{record.reps}</td>
                  <td>{record.total_load}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: "20px", textAlign: "center" }}>総負荷量: <span>{totalLoad}</span> kg</p>
        </section>
      </div>
    </div>
  );
};

export default MeasurePage;