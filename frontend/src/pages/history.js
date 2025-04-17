import React, { useState } from "react";
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
 * 記録履歴画面
 * ・日ごとの記録確認
 * ・部位別 & 総合負荷量の確認
 * ・週ごとの負荷推移グラフ表示
 */
const HistoryPage = () => {
  const {
    dailyHistory,        // 選択中の日の履歴
    selectedDate,        // 現在選択中の日付
    availableDates,      // 選択可能な日付一覧
    categoryTotals,      // 部位別 合計負荷
    overallTotal,        // 総合負荷
    weeklyData,          // 週ごとの負荷推移
    message,             // メッセージ表示用
    selectedCategory,    // グラフ表示対象（部位 or 総合）

    setSelectedCategory, // グラフ表示切替
    setSelectedDate,     // 日付切替

    fetchDailyHistory,   // 日次履歴データ取得
  } = useHistory();
  
  const [showAxisHelp, setShowAxisHelp] = useState(false);

  return (
    <div className={styles.pageContainer}>
      {/* ヘッダー */}
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>計測履歴</h1>
        <HamburgerMenu />
      </div>

      <div className={styles.columnsContainer}>
        {/* 左カラム：日付別履歴 */}
        <div className={styles.leftColumn}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>日付ごとの履歴</h2>

            {/* 日付選択ドロップダウン */}
            <select
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchDailyHistory(e.target.value); // 日付変更時に履歴取得
              }}
              value={selectedDate}
              className={styles.dateSelect}
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

          {/* 日次履歴テーブル */}
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
                {dailyHistory.map((record, idx) => (
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
          ) : (
            <p className={styles.noDataMessage}>
              この日には記録がありません。
            </p>
          )}
        </div>

        {/* 右カラム：部位別 合計負荷 */}
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
                {/* 最終行：全体合計 */}
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

      {/* 下部：週ごとの負荷推移グラフ */}
      <div className={styles.graphContainer}>
        <h2>週ごとの負荷推移</h2>

        {/* グラフ表示データ切替 */}
        <label className={styles.graphSelectLabel}>
          表示するデータ:
          <select
            className={styles.graphSelect}
            onChange={(e) => setSelectedCategory(e.target.value)}
            value={selectedCategory}
          >
            <option value="total_load">総合負荷</option>
            <option value="chest">胸</option>
            <option value="back">背中</option>
            <option value="legs">脚</option>
            <option value="arms">腕</option>
            <option value="shoulders">肩</option>
          </select>
        </label>

        {/* グラフとX軸ヘルプボタンのコンテナ */}
        <div className={styles.graphAndHelpContainer}>
          {/* 負荷推移グラフ */}
          <ResponsiveContainer width="90%" height={500}>
            <LineChart 
              data={weeklyData}
              margin={{ top: 5, right: 40, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={(weekNum) => `W${String(weekNum % 100).padStart(2, '0')}`}
              />
              <YAxis
                domain={[
                  0,
                  weeklyData.length > 0
                    ? Math.max(...weeklyData.map(d => Number(d[selectedCategory]) || 0), 100)
                    : 100,
                ]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 30, 30, 0.9)', 
                  border: '1px solid #444',
                  borderRadius: '5px',
                  color: '#e0e0e0'
                }}
                labelStyle={{ color: '#ffcc00' }}
                itemStyle={{ color: '#e0e0e0' }}
                labelFormatter={(value) => `${Math.floor(value/100)}W${String(value % 100).padStart(2, '0')}`}
              />
              <Line
                type="monotone"
                dataKey={selectedCategory}
                stroke="#ffcc00"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* X軸ヘルプボタン */}
          <div className={styles.axisHelpContainer}>
            <button 
              className={styles.axisHelpButton}
              onClick={() => setShowAxisHelp(!showAxisHelp)}
              aria-label="X軸の説明"
            >
              ?
            </button>
            {showAxisHelp && (
              <div className={styles.axisHelpPopup}>
                <p>W01、W02などの表記は、年間の週番号を表しています。</p>
                <p>例えば、2025W16は2025年の第16週目を意味します。</p>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowAxisHelp(false)}
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default HistoryPage;
