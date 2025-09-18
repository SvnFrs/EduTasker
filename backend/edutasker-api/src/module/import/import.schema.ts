import Joi from "joi";

export const studentImportRowSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  studentId: Joi.string().min(1).max(50).optional(),
  defaultPassword: Joi.string().min(6).optional(),
});

export const studentImportSchema = Joi.object({
  students: Joi.array().items(studentImportRowSchema).min(1).max(1000).required(),
  generateDefaultPassword: Joi.boolean().default(true),
  sendWelcomeEmail: Joi.boolean().default(false),
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

export const fileUploadValidationSchema = Joi.object({
  fieldname: Joi.string().valid("file").required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string()
    .valid(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    )
    .required(),
  size: Joi.number()
    .max(5 * 1024 * 1024)
    .required(), // 5MB limit
});

export const previewImportSchema = Joi.object({
  maxRows: Joi.number().integer().min(1).max(100).default(10),
  validateData: Joi.boolean().default(true),
});
