import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../config/s3.js";
import { config } from "../../config/env.js";

export async function generateUploadUrl(key: string, expiresIn = 3600, contentType?: string) {
  const command = new PutObjectCommand({
    Bucket: config.S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function generateDownloadUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: config.S3_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}
