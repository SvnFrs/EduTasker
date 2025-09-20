import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";
import { createResponseObject } from "../helper/response-object.js";

export const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  limit: config.RATE_LIMIT,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: createResponseObject<void>({
    messages: ["Max limited request"],
    code: "RATE_LIMITED",
    success: false,
    content: undefined,
  }),
});
