import type { NextFunction, Request, Response } from "express";
import tokenService, { TokenType } from "../module/auth/token.service.js";

export enum Action {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1] || "";
    (req as any).user = await tokenService.verifyToken(TokenType.ACCESS, token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
