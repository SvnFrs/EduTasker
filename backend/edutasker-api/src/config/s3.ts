import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./env.js";

export const s3 = new S3Client({
  region: config.S3_REGION,
  endpoint: config.S3_ENDPOINT,
  credentials: {
    accessKeyId: config.S3_ACCESS_KEY_ID!,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});
