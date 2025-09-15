import { Router } from "express";
import {
  getDailyHistory,
  getAvailableDates,
  getTotalLoad,
  getWeeklyData,
} from "../controllers/history";

const router = Router();

router.get("/daily", getDailyHistory as any);

router.get("/dates", getAvailableDates as any);

router.get("/totals", getTotalLoad as any);

router.get("/weekly", getWeeklyData as any);

export default router;