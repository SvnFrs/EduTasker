import type { Request, Response } from "express";
import express, { Router } from "express";
import {
  authRoute,
  boardRoute,
  commentRoute,
  fileRoute,
  importRoute,
  mentorRoute,
  projectRoute,
  roleRoute,
  taskRoute,
  userRoute,
} from "./module/index.js";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express + TypeScript + Bun!" });
});

const projectRouter = Router();
projectRouter.use("/", projectRoute);
projectRouter.use("/", taskRoute);
projectRouter.use("/", commentRoute);

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/import", importRoute);
app.use("/projects", projectRouter);
app.use("/roles", roleRoute);
app.use("/comments", commentRoute);
app.use("/tasks", taskRoute);
app.use("/mentors", mentorRoute);
app.use("/boards", boardRoute);
app.use("/file", fileRoute);
export default app;