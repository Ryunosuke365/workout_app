import { Router } from "express";
import { registerUser } from "../controllers/register";

const router = Router();

router.post("/", registerUser as any);

export default router;