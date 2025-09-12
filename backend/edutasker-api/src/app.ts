import type { Request, Response } from "express";
import express from "express";
import { authRoute, userRoute } from "./module/index.ts";
const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express + TypeScript + Bun!" });
});

app.use('/auth', authRoute);
app.use('/users', userRoute);

export default app;