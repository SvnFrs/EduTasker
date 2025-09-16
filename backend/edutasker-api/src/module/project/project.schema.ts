import Joi from "joi";

export const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional().allow(""),
  status: Joi.string().valid("active", "completed", "cancelled", "on-hold").default("active"),
  deadline: Joi.date().iso().greater("now").optional(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional().allow(""),
  status: Joi.string().valid("active", "completed", "cancelled", "on-hold").optional(),
  deadline: Joi.date().iso().optional().allow(null),
});

export const projectListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
  status: Joi.string().valid("active", "completed", "cancelled", "on-hold").optional(),
  createdBy: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),
  deadline: Joi.string().valid("upcoming", "overdue", "this-week", "this-month").optional(),
});

export const projectIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const addMemberSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  role: Joi.string().valid("LEADER", "MEMBER").default("MEMBER"),
});

export const addMentorSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  role: Joi.string().default("mentor"),
});

export const createBoardSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  order: Joi.number().integer().min(0).optional(),
});

export const updateBoardSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  order: Joi.number().integer().min(0).optional(),
});

export const boardIdParamSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  boardId: Joi.string().uuid().required(),
});

export const assignPermissionSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  action: Joi.string().valid("READ", "CREATE", "UPDATE", "DELETE").required(),
  resource: Joi.string().min(1).required(),
});

export const removeMemberParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
});
