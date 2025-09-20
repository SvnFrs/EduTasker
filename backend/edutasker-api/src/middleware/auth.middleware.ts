import type { NextFunction, Request, Response } from "express";
import tokenService, { TokenType } from "../module/auth/token.service.js";
import { createResponseObject } from "../helper/response-object.js";

export enum Action {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json(
      createResponseObject<void>({
        messages: ["You are not authorized to access this resource"],
        code: "AUTH_ERROR",
        success: false,
        content: undefined,
      }),
    );

  try {
    const token = authHeader.split(" ")[1] || "";
    (req as any).user = await tokenService.verifyToken(TokenType.ACCESS, token);
    next();
  } catch {
    res.status(401).json(
      createResponseObject<void>({
        messages: ["Token is invalid or expired, please login again"],
        code: "AUTH_ERROR",
        success: false,
        content: undefined,
      }),
    );
  }
};
