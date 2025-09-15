import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "@/styles/history.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useHistory from "@/hooks/useHistory";

export default function HistoryPage() {
  const {
    dailyHistory,
    selectedDate,
    availableDates,
    categoryTotals,
    overallTotal,
    selectedCategory,
    periodFilter,
    showAxisHelp,
    message,
    filteredWeekly,
    yMax,
    setSelectedDate,
    setSelectedCategory,
    setPeriodFilter,
    setShowAxisHelp,
    fetchDailyHistory,
  } = useHistory();

  return (
    <div className="pageContainer">
      <header className="headerContainer">
        <h1 className="headerTitle">計測履歴</h1>
        <HamburgerMenu />
      </header>

      {message && <p className="alert alert--warn">{message}</p>}

      <div className="rowContainer">
        <section className={`card ${styles.left}`}>
          <div className={styles.historyHeader}>
            <h2 className="section-header">日付ごとの履歴</h2>
            <select className={`form-control ${styles.dateSelect}`} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); fetchDailyHistory(e.target.value); }}>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                </option>
              ))}
            </select>
          </div>

          {dailyHistory.length ? (
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
                {dailyHistory.map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.category}</td>
                    <td>
                      <div className={styles.recordExerciseContainer}>{r.name}</div>
                    </td>
                    <td>{r.weight}</td>
                    <td>{r.reps}</td>
                    <td>{r.total_load}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="alert alert--info">この日には記録がありません。</p>
          )}
        </section>

        <section className={`card ${styles.right}`}>
          <h2 className="section-header">部位と総合の総負荷量</h2>
          {dailyHistory.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>部位</th>
                  <th>合計負荷</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map((cat: any) => (
                  <tr key={cat.category}>
                    <td>{cat.category}</td>
                    <td>{cat.total_load}</td>
                  </tr>
                ))}
                <tr>
                  <td>ALL</td>
                  <td>{overallTotal}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="alert alert--info">データがありません。</p>
          )}
        </section>
      </div>

      <section className={`card ${styles.graph}`}>
        <h2 className="section-header">週ごとの負荷推移</h2>
        <div className={styles.graphControls}>
          <label className={styles.graphSelectLabel}>
            表示データ：
            <select className={`form-control ${styles.graphSelect}`} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="total_load">総合負荷</option>
              <option value="chest">胸</option>
              <option value="back">背中</option>
              <option value="legs">脚</option>
              <option value="arms">腕</option>
              <option value="shoulders">肩</option>
            </select>
          </label>
          <label className={styles.graphSelectLabel}>
            期間：
            <select className={`form-control ${styles.graphSelect}`} value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
              <option value="3months">直近3ヶ月</option>
              <option value="1year">直近1年</option>
              <option value="all">すべて</option>
            </select>
          </label>
        </div>

        <ResponsiveContainer width="95%" height={500}>
          <LineChart data={filteredWeekly} margin={{ top: 5, right: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tickFormatter={(w: number) => `W${w % 100}`} interval="preserveStartEnd" />
            <YAxis domain={[0, yMax]} />
            <Tooltip labelFormatter={(v: number) => `${Math.floor(v / 100)}-W${v % 100}`} />
            <Legend />
            <Line type="monotone" dataKey={selectedCategory} name={selectedCategory === "total_load" ? "総合負荷" : selectedCategory} stroke="#ffcc00" strokeWidth={2} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>

        <div className={styles.graphAndHelpContainer}>
          <button className={styles.axisHelpButton} onClick={() => setShowAxisHelp(!showAxisHelp)}>?</button>
          {showAxisHelp && (
            <div className={styles.axisHelpPopup}>
              <p>W1〜W53 は ISO-8601 準拠の週番号です。</p>
              <p>年最初の木曜を含む週が「第 1 週」になります。</p>
              <p>例: 2025-W5 = 2025 年第 5 週</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}