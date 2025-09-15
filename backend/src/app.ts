import express, { Application, Request, Response, NextFunction } from "express";

const app: Application = express();

import { applyMiddlewares } from "./middleware/apply";
import { authenticateToken } from "./middleware/auth";

import registerRouter from "./routes/register";
import loginRouter from "./routes/login";
import measureRouter from "./routes/measure";
import historyRouter from "./routes/history";
import settingRouter from "./routes/setting";

applyMiddlewares(app);

app.use("/api/register", registerRouter as any);
app.use("/api/login", loginRouter as any);

app.use("/api/measure", authenticateToken as any, measureRouter as any);
app.use("/api/history", authenticateToken as any, historyRouter as any);
app.use("/api/setting", authenticateToken as any, settingRouter as any);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;