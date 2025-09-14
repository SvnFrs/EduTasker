import Joi from "joi";

export const createRoleSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  permissionIds: Joi.array().items(Joi.string().uuid()).optional(),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
});

export const roleListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
  includePermissions: Joi.boolean().default(false),
});

export const roleIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
});
