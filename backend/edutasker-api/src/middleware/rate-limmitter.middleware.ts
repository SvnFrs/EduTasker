import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

export const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  limit: config.RATE_LIMIT,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    content: null,
    success: false,
    message: "Too many requests from this IP, please try again later.",
    code: "TOO_MANY_REQUESTS",
  },
});