import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  avatarUrl: Joi.string().uri().optional().allow(''),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

export const updateAvatarSchema = Joi.object({
  avatarUrl: Joi.string().uri().required(),
});
