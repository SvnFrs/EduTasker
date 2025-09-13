import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database.js";
import { verifyToken } from '../helper/jwt.js';

export enum Action {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1] || '';
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};


export function requirePermission(action: Action, path: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Unauthorized" });

      const payload = verifyToken(token);
      const userId = payload.id;
      const roles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });

      const permissions = roles.flatMap(r => r.role.permissions.map(p => p.permission));

      const hasPermission = permissions.some(p => {
        const regex = new RegExp(p.pathRegex);
        return p.action === action && regex.test(path);
      });

      if (!hasPermission) {
        return res.status(403).json({ error: "Forbidden" });
      }

      (req as any).user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}
