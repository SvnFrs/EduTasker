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

export const userListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
});

export const userIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const updateUserByIdSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  email: Joi.string().email().optional(),
  avatarUrl: Joi.string().uri().optional().allow(''),
});
