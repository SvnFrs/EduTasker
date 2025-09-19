import Joi from "joi";

export const studentImportRowSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  studentId: Joi.string().min(1).max(50).optional(),
  defaultPassword: Joi.string().min(6).optional(),
});

export const studentTemplateQuerySchema = Joi.object({
  format: Joi.string().valid("xlsx").default("xlsx"),
  includeExample: Joi.boolean().default(true),
});

export const bulkImportOptionsSchema = Joi.object({
  generateDefaultPassword: Joi.boolean().default(true),
  sendWelcomeEmail: Joi.boolean().default(false),
  overwriteExisting: Joi.boolean().default(false),
  validateOnly: Joi.boolean().default(false),
  batchSize: Joi.number().integer().min(1).max(100).default(50),
});

export const importJobQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid("pending", "processing", "completed", "failed").optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
});

export const importJobIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const previewImportSchema = Joi.object({
  maxRows: Joi.number().integer().min(1).max(100).default(10),
  validateData: Joi.boolean().default(true),
});
