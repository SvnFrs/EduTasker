import type { Request, Response } from "express";
import * as ImportService from "./import.service.js";
import * as ImportUtil from "./import.util.js";
import type { BulkImportOptions, StudentTemplateQuery } from "./import.type.js";
import { serviceWrapper } from "../../helper/service-wrapper.js";

const getStudentImportTemplateHandler = async (req: Request, res: Response) => {
  const query: StudentTemplateQuery = req.query;
  const templateBuffer = await ImportService.generateStudentImportTemplate(query);

  res.set({
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": 'attachment; filename="student-import-template.xlsx"',
    "Content-Length": templateBuffer.length.toString(),
  });

  return templateBuffer;
};

const previewImportDataHandler = async (req: Request, res: Response) => {
  const file = (req as any).file;
  const validatedQuery = (req as any).validatedQuery || {};

  const maxRows = validatedQuery.maxRows || 10;
  return await ImportUtil.previewImportData(file.buffer, maxRows);
};

const validateImportDataHandler = async (req: Request, res: Response) => {
  const file = (req as any).file;
  return await ImportUtil.validateImportData(file.buffer);
};

const importStudentsHandler = async (req: Request, res: Response) => {
  const file = (req as any).file;

  const options: BulkImportOptions = {
    generateDefaultPassword: req.body.generateDefaultPassword !== "false",
    sendWelcomeEmail: req.body.sendWelcomeEmail === "true",
    overwriteExisting: req.body.overwriteExisting === "true",
    validateOnly: req.body.validateOnly === "true",
    batchSize: parseInt(req.body.batchSize) || 50,
  };

  return await ImportService.importStudentsFromExcel(file.buffer, options);
};

const getImportHistoryHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

  return await ImportService.getImportHistory(userId, page, limit, status);
};

const getImportJobHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  if (!id) {
    throw new Error("Import job ID is required");
  }

  const job = await ImportService.getImportJob(id, userId);
  if (!job) {
    throw new Error("Import job not found");
  }

  return job;
};

const cancelImportJobHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  if (!id) {
    throw new Error("Import job ID is required");
  }

  const success = await ImportService.cancelImportJob(id, userId);
  if (!success) {
    throw new Error("Failed to cancel import job or job not found");
  }

  return { message: "Import job cancelled successfully" };
};

export const getStudentImportTemplate = serviceWrapper(
  getStudentImportTemplateHandler,
  "Template generated successfully",
);

export const previewImportData = serviceWrapper(
  previewImportDataHandler,
  "Import data preview generated successfully",
);

export const validateImportData = serviceWrapper(
  validateImportDataHandler,
  "Import data validation completed",
);

export const importStudents = serviceWrapper(
  importStudentsHandler,
  "Students imported successfully",
);

export const getImportHistory = serviceWrapper(
  getImportHistoryHandler,
  "Import history retrieved successfully",
);

export const getImportJob = serviceWrapper(
  getImportJobHandler,
  "Import job details retrieved successfully",
);

export const cancelImportJob = serviceWrapper(
  cancelImportJobHandler,
  "Import job cancelled successfully",
);
