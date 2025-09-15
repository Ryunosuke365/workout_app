import { Router } from "express";
import {
  getExercisesByCategory,
  addExercise,
  deleteExercise,
  recordExerciseData,
  getDailyLoadSummary,
} from "../controllers/measure";

const router = Router();

router.get("/exercises/:category", getExercisesByCategory as any);

router.post("/exercises", addExercise as any);

router.delete("/:exercise_id", deleteExercise as any);

router.post("/", recordExerciseData as any);

router.get("/daily-load-summary", getDailyLoadSummary as any);

export default router;