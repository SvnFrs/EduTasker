import Joi from "joi";

export const createBoardSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required().messages({
    "string.min": "Board name is required",
    "string.max": "Board name must be less than 100 characters",
    "any.required": "Board name is required",
  }),
  order: Joi.number().integer().min(0).optional().messages({
    "number.min": "Order must be a non-negative integer",
    "number.integer": "Order must be an integer",
  }),
  projectId: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Invalid project ID format",
    "any.required": "Project ID is required",
  }),
});

export const updateBoardSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().optional().messages({
    "string.min": "Board name cannot be empty",
    "string.max": "Board name must be less than 100 characters",
  }),
  order: Joi.number().integer().min(0).optional().messages({
    "number.min": "Order must be a non-negative integer",
    "number.integer": "Order must be an integer",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const getBoardSchema = Joi.object({
  includeTasks: Joi.boolean().default(false),
  includeTaskCount: Joi.boolean().default(false),
});

export const getProjectBoardsSchema = Joi.object({
  includeTasks: Joi.boolean().default(false),
  includeTaskCount: Joi.boolean().default(false),
});

export const boardIdParamSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Invalid board ID format",
    "any.required": "Board ID is required",
  }),
});

export const projectIdParamSchema = Joi.object({
  projectId: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Invalid project ID format",
    "any.required": "Project ID is required",
  }),
});

export const reorderBoardsSchema = Joi.object({
  boards: Joi.array()
    .items(
      Joi.object({
        boardId: Joi.string().guid({ version: "uuidv4" }).required().messages({
          "string.guid": "Invalid board ID format",
          "any.required": "Board ID is required",
        }),
        newOrder: Joi.number().integer().min(0).required().messages({
          "number.min": "Order must be a non-negative integer",
          "number.integer": "Order must be an integer",
          "any.required": "New order is required",
        }),
      }),
    )
    .min(1)
    .required()
    .custom((value, helpers) => {
      const orders = value.map((board: { newOrder: number }) => board.newOrder);
      const uniqueOrders = new Set(orders);

      if (orders.length !== uniqueOrders.size) {
        return helpers.message({ custom: "All board orders must be unique" });
      }

      return value;
    })
    .messages({
      "array.min": "At least one board must be provided for reordering",
      "any.required": "Boards array is required",
    }),
});
