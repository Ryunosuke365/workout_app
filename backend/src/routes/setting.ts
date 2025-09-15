import { Router } from "express";
import {
  deleteAccount,
  changePassword,
  getUserStats,
  getAvailableDates,
  getDailyHistory,
  updateExerciseRecord,
  deleteExerciseRecord,
} from "../controllers/setting";

const router = Router();

router.delete("/account", deleteAccount as any);

router.put("/account/password", changePassword as any);

router.get("/stats", getUserStats as any);

router.get("/dates", getAvailableDates as any);

router.get("/daily", getDailyHistory as any);

router.put("/records", updateExerciseRecord as any);

router.delete("/records/:record_id", deleteExerciseRecord as any);

export default router;