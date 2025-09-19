import bcrypt from "bcryptjs";
import { prisma } from "../../config/database.js";
import type { AuthenticationResponse, LoginDTO, RegisterDTO } from "./auth.type.ts";
import tokenService, { TokenType } from "./token.service.js";

export const register = async (dto: RegisterDTO) => {
  if (dto.password !== dto.rePassword) throw new Error("Passwords do not match");
  const hashed = await bcrypt.hash(dto.password, 10);
  const user = await prisma.user.create({
    data: {
      email: dto.email,
      name: dto.name,
      passwordHash: hashed,
      roles: {
        create: {
          role: {
            connect: {
              name_code: { name: "Student", code: "STUDENT" },
            },
          },
        },
      },
    },
  });
  return { user };
};

export const login = async (dto: LoginDTO): Promise<AuthenticationResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
    include: {
      roles: {
        include: {
          role: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });
  if (!user) throw new Error("Account not found");

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) throw new Error("Password is incorrect");

  const accessToken = await tokenService.generateToken(TokenType.ACCESS, {
    id: user.id,
    email: user.email,
  });
  const refreshToken = await tokenService.generateToken(TokenType.REFRESH, {
    id: user.id,
    email: user.email,
  });

  const roles = user.roles.map((userRole) => userRole.role.code);

  return {
    accessToken,
    refreshToken,
    roles,
  };
};

export const refreshToken = async (token: string): Promise<AuthenticationResponse> => {
  const decoded = await tokenService.verifyToken(TokenType.ACCESS, token);
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      roles: {
        include: {
          role: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });
  if (!user) throw new Error("User not found");

  const accessToken = await tokenService.generateToken(TokenType.ACCESS, {
    id: user.id,
    email: user.email,
  });
  const newRefreshToken = await tokenService.generateToken(TokenType.REFRESH, {
    id: user.id,
    email: user.email,
  });
  const roles = user.roles.map((userRole) => userRole.role.name);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    roles,
  };
};

export const logout = async (token: string) => {
  const decoded = await tokenService.verifyToken(TokenType.ACCESS, token);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new Error("User not found");
};
