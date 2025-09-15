import { Request, Response } from "express";
import db from "../db";

const query = (sql: string, params: any[] = []) => db.execute(sql, params);
const extractUserId = (req: any) => req.user.user_id as number | string;

export const getAvailableDates = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const [rows]: any = await query(
      `SELECT DISTINCT DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') AS date
         FROM exercise_records
        WHERE user_id = ?
        ORDER BY date DESC`,
      [user_id]
    );
    res.json({ dates: rows.map((r: any) => r.date) });
  } catch (error) {
    res.status(500).json({ error: "利用可能な日付の取得に失敗しました。" });
  }
};

export const getDailyHistory = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const { date } = req.query as { date?: string };
    const [rows]: any = await query(
      `SELECT e.category, e.name, r.weight, r.reps, r.total_load
         FROM exercise_records r
         JOIN exercises e ON r.exercise_id = e.id
        WHERE r.user_id = ?
          AND DATE(r.recorded_at) = ?`,
      [user_id, date]
    );
    res.json({ dailyHistory: rows });
  } catch (error) {
    res.status(500).json({ error: "データの取得に失敗しました。" });
  }
};

export const getTotalLoad = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const [categoryTotals]: any = await query(
      `SELECT e.category, SUM(r.total_load) AS total_load
         FROM exercise_records r
         JOIN exercises e ON r.exercise_id = e.id
        WHERE r.user_id = ?
        GROUP BY e.category`,
      [user_id]
    );
    const [overall]: any = await query(
      `SELECT COALESCE(SUM(total_load), 0) AS total_load
         FROM exercise_records
        WHERE user_id = ?`,
      [user_id]
    );
    res.json({ categoryTotals, overallTotal: overall[0].total_load });
  } catch (error) {
    res.status(500).json({ error: "総負荷の取得に失敗しました。" });
  }
};

export const getWeeklyData = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const [data]: any = await query(
      `SELECT 
        CONCAT(YEAR(recorded_at), LPAD(WEEK(recorded_at, 1), 2, '0')) AS week,
        e.category,
        SUM(r.total_load) AS total_load
       FROM exercise_records r
       JOIN exercises e ON r.exercise_id = e.id
       WHERE r.user_id = ?
       GROUP BY week, e.category
       ORDER BY week ASC`,
      [user_id]
    );
    type WeeklyRow = { week: string; category: string; total_load: number };
    const typedData = data as WeeklyRow[];
    const categories: string[] = [...new Set(typedData.map((d) => d.category))];
    const combined: Record<string, any> = {};
    typedData.forEach(({ week, category, total_load }: WeeklyRow) => {
      if (!combined[week]) {
        combined[week] = { week, total_load: 0 };
        categories.forEach((c: string) => (combined[week][c] = 0));
      }
      combined[week][category] = total_load;
      combined[week].total_load += total_load;
    });
    res.json({ weeklyData: Object.values(combined) });
  } catch (error) {
    res.status(500).json({ error: "週ごとのデータ取得に失敗しました。" });
  }
};

export default {
  getAvailableDates,
  getDailyHistory,
  getTotalLoad,
  getWeeklyData,
};