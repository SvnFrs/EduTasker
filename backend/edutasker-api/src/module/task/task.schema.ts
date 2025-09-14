import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(2000).optional().allow(''),
  status: Joi.string().valid('todo', 'doing', 'done').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.date().iso().optional(),
  assigneeIds: Joi.array().items(Joi.string().uuid()).optional(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(2000).optional().allow(''),
  status: Joi.string().valid('todo', 'doing', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  dueDate: Joi.date().iso().optional().allow(null),
});

export const taskListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
  status: Joi.string().valid('todo', 'doing', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  assignedTo: Joi.string().uuid().optional(),
  createdBy: Joi.string().uuid().optional(),
  dueDate: Joi.string().valid('upcoming', 'overdue', 'today', 'this-week').optional(),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'title').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const projectTaskParamSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  taskId: Joi.string().uuid().required(),
});

export const projectIdParamSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
});

export const assignTaskSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

export const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('todo', 'doing', 'done').required(),
});
