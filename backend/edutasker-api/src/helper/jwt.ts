import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { config } from "../config/env.js";

export const signToken = (payload: object) => {
  const options: SignOptions = { expiresIn: config.JWT_EXPIRES_IN };
  return jwt.sign(payload, config.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, config.JWT_SECRET as string);
};
