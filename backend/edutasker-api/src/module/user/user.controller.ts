import type { Request, Response } from "express";
import * as UserService from './user.service.js';
import type { ChangePasswordDTO, UpdateAvatarDTO, UpdateProfileDTO, UserListQuery, UpdateUserByIdDTO } from './user.type.js';
import { serviceWrapper } from "../../helper/service-wrapper.js";

const getProfileHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  return await UserService.getUserProfile(userId);
};

const updateProfileHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data: UpdateProfileDTO = req.body;
  return await UserService.updateUserProfile(userId, data);
};

const changePasswordHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data: ChangePasswordDTO = req.body;
  await UserService.changeUserPassword(userId, data);
  return { message: "Password changed successfully" };
};

const updateAvatarHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data: UpdateAvatarDTO = req.body;
  return await UserService.updateUserAvatar(userId, data);
};

const listUsersHandler = async (req: Request, res: Response) => {
  const query: UserListQuery = req.query;
  return await UserService.getAllUsers(query);
};

const getUserByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("User ID is required");
  }
  return await UserService.getUserById(id);
};

const updateUserByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("User ID is required");
  }
  const data: UpdateUserByIdDTO = req.body;
  return await UserService.updateUserById(id, data);
};

const deleteUserByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("User ID is required");
  }
  await UserService.deleteUserById(id);
  return { message: "User deleted successfully" };
};

export const getProfile = serviceWrapper(getProfileHandler, "Profile retrieved successfully");
export const updateProfile = serviceWrapper(updateProfileHandler, "Profile updated successfully");
export const changePassword = serviceWrapper(changePasswordHandler, "Password changed successfully");
export const updateAvatar = serviceWrapper(updateAvatarHandler, "Avatar updated successfully");
export const listUsers = serviceWrapper(listUsersHandler, "Users retrieved successfully");
export const getUserById = serviceWrapper(getUserByIdHandler, "User retrieved successfully");
export const updateUserById = serviceWrapper(updateUserByIdHandler, "User updated successfully");
export const deleteUserById = serviceWrapper(deleteUserByIdHandler, "User deleted successfully");
