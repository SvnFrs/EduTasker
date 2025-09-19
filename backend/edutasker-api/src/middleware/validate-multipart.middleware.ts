import type { RequestHandler } from "express";
import Joi from "joi";

export function validateFileUpload(
  requiredFile: boolean = true,
  allowedMimeTypes: string[] = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ],
  maxSize: number = 5 * 1024 * 1024, // 5MB
): RequestHandler {
  return (req, res, next) => {
    const file = (req as any).file;

    if (requiredFile && !file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
        error: "No file uploaded",
        code: "400",
      });
    }

    if (file) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type",
          error: `Only ${allowedMimeTypes.join(", ")} files are allowed`,
          code: "400",
        });
      }

      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: "File too large",
          error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
          code: "400",
        });
      }

      if (file.size === 0) {
        return res.status(400).json({
          success: false,
          message: "Empty file",
          error: "Uploaded file is empty",
          code: "400",
        });
      }
    }

    next();
  };
}

export function validateQuery<TQuery extends Record<string, unknown>>(
  schema: Joi.ObjectSchema<TQuery>,
): RequestHandler<any, unknown, any, TQuery> {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Query validation error",
        error: error.message,
        code: "400",
      });
    }

    (req as any).validatedQuery = value;
    next();
  };
}
