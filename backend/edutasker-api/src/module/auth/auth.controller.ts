import type { Request, Response } from "express";
import * as AuthService from "./auth.service.js";
import { serviceWrapper } from "../../helper/service-wrapper.js";

const registerHandler = async (req: Request, res: Response) => {
  return await AuthService.register(req.body);
};

const loginHandler = async (req: Request, res: Response) => {
  return await AuthService.login(req.body);
};

const logoutHandler = async (req: Request, res: Response) => {
  return await AuthService.logout(req.body);
};

const refreshTokenHandler = async (req: Request, res: Response) => {
  return await AuthService.refreshToken(req.body);
};

export const register = serviceWrapper(registerHandler, "User registered successfully");
export const login = serviceWrapper(loginHandler, "User logged in successfully");
export const logout = serviceWrapper(logoutHandler, "User logged out successfully");
export const refreshToken = serviceWrapper(refreshTokenHandler, "Token refreshed successfully");
