import bcrypt from "bcryptjs";
import { prisma } from '../../config/database.js';
import type { UpdateProfileDTO, ChangePasswordDTO, UserProfileResponse, UpdateAvatarDTO } from './user.type.js';

const mapToUserProfileResponse = (user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserProfileResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl ?? undefined,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return mapToUserProfileResponse(user);
};

export const updateUserProfile = async (userId: string, data: UpdateProfileDTO): Promise<UserProfileResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return mapToUserProfileResponse(updatedUser);
};

export const changeUserPassword = async (userId: string, data: ChangePasswordDTO): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedNewPassword,
    },
  });
};

export const updateUserAvatar = async (userId: string, data: UpdateAvatarDTO): Promise<UserProfileResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: data.avatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return mapToUserProfileResponse(updatedUser);
};
