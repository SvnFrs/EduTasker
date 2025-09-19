import type { JwtPayload } from "jsonwebtoken";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
  rePassword: string;
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  roles: string[];
}
