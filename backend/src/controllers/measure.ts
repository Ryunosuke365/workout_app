import { Request, Response } from "express";
import db from "../db";

const query = (sql: string, params: any[] = []) => db.execute(sql, params);
const extractUserId = (req: any) => req.user.user_id as number | string;

export const getExercisesByCategory = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const { category } = req.params as { category: string };

    const [exercises]: any = await query(
      "SELECT id, name FROM exercises WHERE user_id = ? AND category = ?",
      [user_id, category]
    );
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: "種目の取得に失敗しました。" });
  }
};

export const getDailyLoadSummary = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const [records]: any = await query(
      `SELECT 
         e.category,
         e.name,
         r.weight,
         r.reps,
         r.total_load
       FROM exercise_records AS r
       JOIN exercises AS e ON r.exercise_id = e.id
       WHERE r.user_id = ?
         AND DATE(r.recorded_at) = CURDATE()`,
      [user_id]
    );

    const totalLoad = records.reduce((sum: number, r: any) => sum + r.total_load, 0);
    res.json({ records, totalLoad });
  } catch (error) {
    res.status(500).json({ error: "データ取得に失敗しました。" });
  }
};

export const addExercise = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const { name, category } = req.body as { name: string; category: string };

    if (!name.trim()) {
      res.status(400).json({ error: "種目名は必須です。" });
      return;
    }

    await query(
      "INSERT INTO exercises (user_id, name, category) VALUES (?, ?, ?)",
      [user_id, name, category]
    );
    res.status(201).json({ message: "種目を追加しました" });
  } catch (error) {
    res.status(500).json({ error: "種目の追加に失敗しました。" });
  }
};

export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const { exercise_id } = req.params as { exercise_id: string };

    await query(
      "DELETE FROM exercise_records WHERE user_id = ? AND exercise_id = ?",
      [user_id, exercise_id]
    );
    await query("DELETE FROM exercises WHERE user_id = ? AND id = ?", [user_id, exercise_id]);

    res.json({ message: "種目を削除しました" });
  } catch (error) {
    res.status(500).json({ error: "種目の削除に失敗しました。" });
  }
};

export const recordExerciseData = async (req: Request, res: Response) => {
  try {
    const user_id = extractUserId(req);
    const { exercise_id, weight, reps } = req.body as {
      exercise_id: number;
      weight: number;
      reps: number;
    };

    if (!weight || !reps) {
      res.status(400).json({ error: "すべての項目を入力してください。" });
      return;
    }

    const total_load = weight * reps;

    await query(
      `INSERT INTO exercise_records 
       (user_id, exercise_id, weight, reps, total_load, recorded_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [user_id, exercise_id, weight, reps, total_load]
    );

    res.status(201).json({ message: "トレーニングデータを保存しました" });
  } catch (error) {
    res.status(500).json({ error: "データ保存に失敗しました。" });
  }
};

export default {
  getExercisesByCategory,
  getDailyLoadSummary,
  addExercise,
  deleteExercise,
  recordExerciseData,
};