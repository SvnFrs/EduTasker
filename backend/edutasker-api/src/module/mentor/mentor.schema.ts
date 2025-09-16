import Joi from "joi";

export const createMentorSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  expertise: Joi.string().min(1).max(500).optional(),
  bio: Joi.string().min(1).max(1000).optional(),
});

export const updateMentorSchema = Joi.object({
  expertise: Joi.string().min(1).max(500).optional(),
  bio: Joi.string().min(1).max(1000).optional(),
});

export const updateMentorByIdSchema = Joi.object({
  expertise: Joi.string().min(1).max(500).optional(),
  bio: Joi.string().min(1).max(1000).optional(),
  verified: Joi.boolean().optional(),
});

export const mentorListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  verified: Joi.string().valid("true", "false").optional(),
  expertise: Joi.string().optional(),
  search: Joi.string().optional(),
});

export const mentorIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const userIdParamSchema = Joi.object({
  userId: Joi.string().uuid().required(),
});

export const verifyMentorSchema = Joi.object({
  verified: Joi.boolean().required(),
});
