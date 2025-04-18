// pages/HistoryPage.jsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "@/styles/history.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useHistory from "@/hooks/useHistory";

/**
 * 記録履歴画面コンポーネント
 * - 日ごとの記録確認
 * - 部位別 & 総合負荷量確認
 * - 週次グラフ表示
 */
const HistoryPage = () => {
  const {
    dailyHistory,
    selectedDate,
    setSelectedDate,
    availableDates,
    categoryTotals,
    overallTotal,
    weeklyData,
    selectedCategory,
    setSelectedCategory,
    periodFilter,
    setPeriodFilter,
    showAxisHelp,
    setShowAxisHelp,
    message,
    fetchDailyHistory,
  } = useHistory();

  // フィルタ＆ソート済み週次データ
  const filteredWeekly = useMemo(() => {
    if (!weeklyData.length) return [];
    let data = [...weeklyData];
    if (periodFilter !== "all") {
      const limit = periodFilter === "3months" ? 13 : 52;
      data = data.sort((a, b) => b.week - a.week).slice(0, limit);
    }
    return data.sort((a, b) => a.week - b.week);
  }, [weeklyData, periodFilter]);

  // Y軸最大値
  const yMax = useMemo(() => {
    if (!filteredWeekly.length) return 100;
    return Math.max(100, ...filteredWeekly.map((d) => Number(d[selectedCategory]) || 0));
  }, [filteredWeekly, selectedCategory]);

  return (
    <div className={styles.pageContainer}>
      {/* ヘッダーエリア */}
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>計測履歴</h1>
        <HamburgerMenu />
      </div>

      {/* メイン：左日次履歴・右合計負荷 */}
      <div className={styles.columnsContainer}>
        <div className={styles.leftColumn}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>日付ごとの履歴</h2>
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
          {dailyHistory.length > 0 ? (
            <table className={styles.historyTable}>
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
                {dailyHistory.map((rec, idx) => (
                  <tr key={idx}>
                    <td>{rec.category}</td>
                    <td>{rec.name}</td>
                    <td>{rec.weight}</td>
                    <td>{rec.reps}</td>
                    <td>{rec.total_load}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noDataMessage}>この日には記録がありません。</p>
          )}
        </div>

        <div className={styles.rightColumn}>
          <h2>部位と総合の総負荷量</h2>
          {categoryTotals.length > 0 ? (
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <th>部位</th>
                  <th>合計負荷</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.category}</td>
                    <td>{item.total_load}</td>
                  </tr>
                ))}
                <tr className={styles.fixedTotalRow}>
                  <td>ALL</td>
                  <td>{overallTotal}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className={styles.noDataMessage}>データがありません。</p>
          )}
        </div>
      </div>

      {/* 週次グラフ */}
      <div className={styles.graphContainer}>
        <h2>週ごとの負荷推移</h2>
        <div className={styles.graphControls}>
          <label className={styles.graphSelectLabel}>
            表示データ：
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.graphSelect}
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
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className={styles.graphSelect}
            >
              <option value="3months">直近3ヶ月</option>
              <option value="1year">直近1年</option>
              <option value="all">すべて</option>
            </select>
          </label>
        </div>
        <ResponsiveContainer width="95%" height={500}>
          <LineChart data={filteredWeekly} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tickFormatter={(w) => `W${w % 100}`} interval="preserveStartEnd" />
            <YAxis domain={[0, yMax]} />
            <Tooltip
              contentClassName={styles.tooltip}
              labelClassName={styles.tooltipLabel}
              itemClassName={styles.tooltipItem}
              labelFormatter={(val) => `${Math.floor(val / 100)}-W${val % 100}`}
            />
            <Line type="monotone" dataKey={selectedCategory} stroke="#ffcc00" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className={styles.graphAndHelpContainer}>
          <button
            className={styles.axisHelpButton}
            onClick={() => setShowAxisHelp(!showAxisHelp)}
          >
            ?
          </button>
          {showAxisHelp && (
            <div className={styles.axisHelpPopup}>
              <p>W1~W53はISO 8601準拠の週番号です。</p>
              <p>年の最初の週は、その年の最初の木曜を含む週と定義されます。</p>
              <p>例：2025-W5 は 2025年第5週。</p>
            </div>
          )}
        </div>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default HistoryPage;