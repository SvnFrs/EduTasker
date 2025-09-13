import type { Request, Response } from "express";
import * as UserService from './user.service.js';
import type { ChangePasswordDTO, UpdateAvatarDTO, UpdateProfileDTO } from './user.type.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await UserService.getUserProfile(userId);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data: UpdateProfileDTO = req.body;

    const updatedUser = await UserService.updateUserProfile(userId, data);
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data: ChangePasswordDTO = req.body;

    await UserService.changeUserPassword(userId, data);
    res.json({ message: "Password changed successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data: UpdateAvatarDTO = req.body;

    const updatedUser = await UserService.updateUserAvatar(userId, data);
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
