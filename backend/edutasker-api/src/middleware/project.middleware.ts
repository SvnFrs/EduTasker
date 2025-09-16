import { PrismaClient } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ProjectRole, type ProjectAction } from "../module/project/project.type.js";

const prisma = new PrismaClient();

export function projectGuard(action: ProjectAction, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      const member = await prisma.projectMember.findFirst({
        where: { projectId, userId: user.id },
      });

      if (!member) {
        return res.status(403).json({ error: "Not a project member" });
      }
      if (member.role === ProjectRole.MENTOR) {
        return next();
      }
      const permission = await prisma.projectPermission.findFirst({
        where: {
          projectId,
          userId: user.id,
          action,
          resource,
        },
      });

      if (!permission) {
        return res.status(403).json({ error: "Forbidden by ACL" });
      }

      next();
    } catch (err) {
      console.error("ACL Guard Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
