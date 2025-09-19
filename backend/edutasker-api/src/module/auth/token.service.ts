import type { TokenPayload } from "./auth.type.js";
import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../../config/env.js";

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

const tokenService = {
  async generateToken(type: TokenType = TokenType.ACCESS, payload: TokenPayload): Promise<string> {
    switch (type) {
      case TokenType.ACCESS:
        const options: SignOptions = { expiresIn: config.JWT_EXPIRES_IN };
        return jwt.sign(payload, config.JWT_SECRET, options);
      case TokenType.REFRESH:
        const refreshOptions: SignOptions = { expiresIn: config.JWT_REFRESH_EXPIRES_IN };
        return jwt.sign(payload, config.JWT_REFRESH_SECRET, refreshOptions);
    }
  },

  async verifyToken(type: TokenType = TokenType.ACCESS, token: string): Promise<TokenPayload> {
    switch (type) {
      case TokenType.ACCESS:
        return jwt.verify(token, config.JWT_SECRET as string) as TokenPayload;
      case TokenType.REFRESH:
        return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
    }
  },
};

export default tokenService;
