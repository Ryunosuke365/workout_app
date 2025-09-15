import { Router } from "express";
import { loginUser } from "../controllers/login";

const router = Router();

router.post("/", loginUser as any);

export default router;