import Joi from "joi";

export const createRoleSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  code: Joi.string().min(1).max(50).required(),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  code: Joi.string().min(1).max(50).optional(),
});

export const roleListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
});

export const roleIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
