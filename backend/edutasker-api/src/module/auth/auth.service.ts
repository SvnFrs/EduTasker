import bcrypt from "bcryptjs";
import { prisma } from '../../config/database.js';
import { signToken, verifyToken } from '../../helper/jwt.js';
import type { LoginDTO, RegisterDTO } from "./auth.type.ts";

export const register = async (dto: RegisterDTO) => {
  const hashed = await bcrypt.hash(dto.password, 10);
  const user = await prisma.user.create({
    data: { ...dto, passwordHash: hashed },
  });
  return { user, token: signToken({ id: user.id, email: user.email }) };
};

export const login = async (dto: LoginDTO) => {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  return { user, token: signToken({ id: user.id, email: user.email }) };
};

export const refreshToken = async (token: string) => {
  const decoded = verifyToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error("User not found");

  return { user, token: signToken({ id: user.id, email: user.email }) };
};

export const logout = async (token: string) => {
  const decoded = verifyToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error("User not found");
};
