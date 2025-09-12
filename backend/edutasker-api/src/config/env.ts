import Joi from "joi";
import ConfigLoader from "../helper/env-loader.ts";

interface EnvSchema {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
}

const validators = {
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.number().default(1000),
};
const configLoader = new ConfigLoader<EnvSchema>(validators, (env) => ({
  ...env,
  PORT: Number(env.PORT),
}));
export const config = configLoader.config;
