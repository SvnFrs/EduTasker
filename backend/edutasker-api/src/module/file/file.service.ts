import { generateUploadUrl } from "./s3.util.js";

const createPresignUrl = async (fileName: string, contentType: string) => {
  if (!fileName || !contentType) {
    throw new Error("File name and content type are required");
  }
  return await generateUploadUrl(fileName, 3600, contentType);
};

export { createPresignUrl };
