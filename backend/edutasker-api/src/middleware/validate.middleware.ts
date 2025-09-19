import type { RequestHandler } from "express";
import Joi from "joi";

export function validate<
  TParams extends Record<string, string> = {},
  TQuery extends Record<string, unknown> = {},
  TBody extends Record<string, unknown> = {},
>(schemas: {
  params?: Joi.ObjectSchema<TParams>;
  query?: Joi.ObjectSchema<TQuery>;
  body?: Joi.ObjectSchema<TBody>;
}): RequestHandler<TParams, unknown, TBody, TQuery> {
  return (req, res, next) => {
    if (schemas.params) {
      const { value, error } = schemas.params.validate(req.params);
      if (error) return res.status(400).json({ error: error.message });
      Object.assign(req.params, value);
    }

    if (schemas.query) {
      const { value, error } = schemas.query.validate(req.query);
      if (error) return res.status(400).json({ error: error.message });
      Object.assign(req.query, value);
    }

    if (schemas.body) {
      const { value, error } = schemas.body.validate(req.body);
      if (error) return res.status(400).json({ error: error.message });
      Object.assign(req.body, value);
    }
    next();
  };
}
