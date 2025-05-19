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

import styles  from "@/styles/history.module.css";
import HamburgerMenu  from "@/components/HamburgerMenu";
import useHistory     from "@/hooks/useHistory";

// 計測履歴ページのコンポーネント
export default function HistoryPage() {
  // useHistoryフックから状態と関数を取得
  const {
    dailyHistory,      // 選択された日付の履歴
    selectedDate,      // 選択中の日付
    availableDates,    // 履歴が存在する日付のリスト
    categoryTotals,    // カテゴリ別の総負荷量
    overallTotal,      // 全体の総負荷量
    selectedCategory,  // グラフで選択中のカテゴリ
    periodFilter,      // グラフの表示期間フィルター
    showAxisHelp,      // グラフの軸ヘルプ表示状態
    message,           // ユーザーへのメッセージ

    filteredWeekly,    // 整形済みの週次データ (フックから取得)
    yMax,              // グラフのY軸の最大値 (フックから取得)

    setSelectedDate,     // 選択日付を更新する関数
    setSelectedCategory, // グラフの表示カテゴリを更新する関数
    setPeriodFilter,     // グラフの表示期間を更新する関数
    setShowAxisHelp,     // 軸ヘルプの表示/非表示を切り替える関数
    
    fetchDailyHistory,   // 特定の日付の履歴を取得する関数
  } = useHistory();

  // JSXレンダリング
  return (
    <div className="pageContainer">
      {/* ヘッダーセクション */}
      <header className="headerContainer">
        <h1 className="headerTitle">計測履歴</h1>
        <HamburgerMenu />
      </header>

      {/* メッセージ表示エリア */}
      {message && <p className="alert alert--warn">{message}</p>}

      {/* メインコンテンツエリア (2カラムレイアウト) */}
      <div className="rowContainer">
        {/* 左カラム: 日付ごとの履歴 */}
        <section className={`card ${styles.left}`}>
          <div className={styles.historyHeader}>
            <h2 className="section-header">日付ごとの履歴</h2>
            {/* 日付選択ドロップダウン */}
            <select
              className={`form-control ${styles.dateSelect}`}
              value={selectedDate} // 現在選択中の日付
              onChange={(e) => {
                setSelectedDate(e.target.value); // 選択された日付を更新
                fetchDailyHistory(e.target.value); // 選択された日付の履歴を再取得
              }}
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {/* 日付を日本語形式で表示 */}
                  {new Date(d).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* 日付ごとの履歴テーブル */}
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
                {dailyHistory.map((r, i) => (
                  <tr key={i}>
                    <td>{r.category}</td>
                    <td>
                      <div className={styles.recordExerciseContainer}>
                        {r.name}
                      </div>
                    </td>
                    <td>{r.weight}</td>
                    <td>{r.reps}</td>
                    <td>{r.total_load}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // 履歴がない場合の表示
            <p className="alert alert--info">この日には記録がありません。</p>
          )}
        </section>

        {/* 右カラム: 部位別・総合負荷 */}
        <section className={`card ${styles.right}`}>
          <h2 className="section-header">部位と総合の総負荷量</h2>

          {/* 部位別・総合負荷テーブル */}
          {dailyHistory.length ? ( // dailyHistoryではなく、categoryTotalsやoverallTotalの有無で判定する方が適切かもしれない
            <table className="table">
              <thead>
                <tr>
                  <th>部位</th>
                  <th>合計負荷</th>
                </tr>
              </thead>
              <tbody>
                {/* 定義済みのカテゴリ順に表示 */}
                {categoryTotals.map((cat) => (
                  <tr key={cat.category}>
                    <td>{cat.category}</td>
                    <td>{cat.total_load}</td>
                  </tr>
                ))}
                {/* 全体の合計負荷 */}
                <tr>
                  <td>ALL</td>
                  <td>{overallTotal}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            // データがない場合の表示
            <p className="alert alert--info">データがありません。</p>
          )}
        </section>
      </div>

      {/* 週次グラフセクション */}
      <section className={`card ${styles.graph}`}>
        <h2 className="section-header">週ごとの負荷推移</h2>

        {/* グラフ操作UI (表示データ選択、期間選択) */}
        <div className={styles.graphControls}>
          <label className={styles.graphSelectLabel}>
            表示データ：
            <select
              className={`form-control ${styles.graphSelect}`}
              value={selectedCategory} // 現在選択中のカテゴリ
              onChange={(e) => setSelectedCategory(e.target.value)} // 選択変更でカテゴリ更新
            >
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
            <select
              className={`form-control ${styles.graphSelect}`}
              value={periodFilter} // 現在選択中の期間
              onChange={(e) => setPeriodFilter(e.target.value)} // 選択変更で期間更新
            >
              <option value="3months">直近3ヶ月</option>
              <option value="1year">直近1年</option>
              <option value="all">すべて</option>
            </select>
          </label>
        </div>

        {/* グラフ描画エリア (Rechartsを使用) */}
        <ResponsiveContainer width="95%" height={500}>
          <LineChart
            data={filteredWeekly} // 整形済みの週次データ
            margin={{ top: 5, right: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" /> {/* グリッド線 */}
            <XAxis
              dataKey="week" // X軸のデータキー (週番号)
              tickFormatter={(w) => `W${w % 100}`} // X軸の目盛り表示形式 (例: W01)
              interval="preserveStartEnd" // X軸の目盛りの間隔調整
            />
            <YAxis domain={[0, yMax]} /> {/* Y軸のドメイン (0から計算された最大値まで) */}
            <Tooltip
              contentClassName={styles.tooltip} // ツールチップのスタイル
              labelClassName={styles.tooltipLabel}
              itemClassName={styles.tooltipItem}
              labelFormatter={(v) => `${Math.floor(v / 100)}-W${v % 100}`} // ツールチップのラベル表示形式
            />
            <Legend /> {/* 凡例 */}
            <Line
              type="monotone" // 線の種類
              dataKey={selectedCategory} // Y軸のデータキー (選択されたカテゴリ)
              name={ // 凡例に表示する名前
                selectedCategory === "total_load"
                  ? "総合負荷"
                  : selectedCategory
              }
              stroke="#ffcc00" // 線の色
              strokeWidth={2} // 線の太さ
              activeDot={{ r: 6 }} // アクティブな点のスタイル
            />
          </LineChart>
        </ResponsiveContainer>

        {/* グラフの軸ヘルプ表示 */}
        <div className={styles.graphAndHelpContainer}>
          <button
            className={styles.axisHelpButton}
            onClick={() => setShowAxisHelp(!showAxisHelp)} // クリックでヘルプ表示/非表示切り替え
          >
            ?
          </button>
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