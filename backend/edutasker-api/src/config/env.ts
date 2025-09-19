import Joi from "joi";
import ConfigLoader from "../helper/env-loader.js";

interface EnvSchema {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: number;
  JWT_REFRESH_EXPIRES_IN: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  S3_BUCKET_NAME: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_REGION: string;
  S3_ENDPOINT: string;
}

const validators = {
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.number().default(1000),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.number().default(10000),
  REDIS_HOST: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().default(""),
  S3_BUCKET_NAME: Joi.string().required(),
  S3_ACCESS_KEY_ID: Joi.string().required(),
  S3_SECRET_ACCESS_KEY: Joi.string().required(),
  S3_REGION: Joi.string().required(),
  S3_ENDPOINT: Joi.string().required(),
};
const configLoader = new ConfigLoader<EnvSchema>(validators, (env) => ({
  ...env,
  PORT: Number(env.PORT),
}));
export const config = configLoader.config;
