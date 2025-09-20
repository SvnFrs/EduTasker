import type { Request, Response } from "express";
import * as FileService from "./file.service.js";
import { serviceWrapper } from "../../helper/service-wrapper.js";

const createPresignedUrlHandler = async (req: Request, res: Response) => {
  const { fileName, contentType } = req.body;

  if (!fileName || !contentType) {
    throw new Error("fileName and contentType are required");
  }

  const uploadUrl = await FileService.createPresignUrl(fileName, contentType);

  return {
    uploadUrl,
    fileName,
    contentType,
  };
};

export const createPresignedUrl = serviceWrapper(
  createPresignedUrlHandler,
  "Presigned URL generated successfully",
);
