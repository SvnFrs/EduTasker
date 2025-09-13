import type { JwtPayload } from "jsonwebtoken";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}
