import Joi from "joi";

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

export const commentListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

export const taskCommentParamSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  taskId: Joi.string().uuid().required(),
});

export const deleteCommentParamSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  taskId: Joi.string().uuid().required(),
  commentId: Joi.string().uuid().required(),
});
