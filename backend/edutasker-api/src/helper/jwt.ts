import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config/env.js";
import type { TokenPayload } from "../module/auth/auth.type.js";

export const signToken = (payload: TokenPayload) => {
  const options: SignOptions = { expiresIn: config.JWT_EXPIRES_IN };
  return jwt.sign(payload, config.JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_SECRET as string) as TokenPayload;
};
