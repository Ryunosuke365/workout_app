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
  const [periodFilter, setPeriodFilter] = useState('3months'); // デフォルトは3ヶ月

  // 期間でフィルタリングしたデータを取得
  const getFilteredWeeklyData = () => {
    if (!weeklyData || weeklyData.length === 0) return [];
    
    // console.log("週データ全部:", weeklyData); // デバッグ
    
    // まずweeklyDataを複製してから処理
    let result = [...weeklyData];
    
    if (periodFilter !== 'all') {
      // データをweekの降順でソート（日付が新しい順）
      const sortedData = [...weeklyData].sort((a, b) => b.week - a.week);
      
      if (periodFilter === '3months') {
        // 直近3ヶ月 (約13週間)
        result = sortedData.slice(0, Math.min(13, sortedData.length));
      } else if (periodFilter === '1year') {
        // 直近1年 (52週間)
        result = sortedData.slice(0, Math.min(52, sortedData.length));
      }
      
      // 表示用に日付順（週番号の昇順）に並べ直す
      result = result.sort((a, b) => a.week - b.week);
    }
    
    return result;
  };

  const filteredWeeklyData = getFilteredWeeklyData();

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

        <div className={styles.graphControls}>
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

          {/* 期間選択 */}
          <label className={styles.graphSelectLabel}>
            期間:
            <select
              className={styles.graphSelect}
              onChange={(e) => setPeriodFilter(e.target.value)}
              value={periodFilter}
            >
              <option value="3months">直近3ヶ月</option>
              <option value="1year">直近1年</option>
              <option value="all">すべて</option>
            </select>
          </label>
        </div>

        {/* グラフとX軸ヘルプボタンのコンテナ */}
        <div className={styles.graphAndHelpContainer}>
          {/* 負荷推移グラフ */}
          <ResponsiveContainer width="95%" height={500}>
            <LineChart 
              data={filteredWeeklyData}
              margin={{ top: 5, right: 20, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={(weekNum) => {
                  const year = Math.floor(weekNum / 100);
                  const week = weekNum % 100;
                  // ISO 8601では週番号に先頭のゼロをつけないのが正式
                  return `W${week}`;
                }}
              />
              <YAxis
                domain={[
                  0,
                  filteredWeeklyData.length > 0
                    ? Math.max(...filteredWeeklyData.map(d => Number(d[selectedCategory]) || 0), 100)
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
                labelFormatter={(value) => {
                  const year = Math.floor(value / 100);
                  const week = value % 100;
                  // ISO 8601では「YYYY-Www」形式が正式
                  return `${year}-W${week}`;
                }}
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
                <p>W1～W53の表記は、ISO 8601規格による年間の週番号を表しています。</p>
                <p>ISO 8601では、年の最初の週(W1)は、その年の最初の木曜日を含む週と定義されます。</p>
                <p>例えば、2025-W5は2025年の第5週を意味します。</p>
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
