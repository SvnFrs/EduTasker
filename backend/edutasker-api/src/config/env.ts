import Joi from "joi";
import ConfigLoader from "../helper/env-loader.js";

interface EnvSchema {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
}

const validators = {
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.number().default(1000),
  REDIS_HOST: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().default(""),
};
const configLoader = new ConfigLoader<EnvSchema>(validators, (env) => ({
  ...env,
  PORT: Number(env.PORT),
}));
export const config = configLoader.config;
