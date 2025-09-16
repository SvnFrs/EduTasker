import type { Request, Response } from "express";
import type { IPaginationWrapper } from "./response-object.js";
import { createResponseObject, unwrapPaginationWrapper } from "./response-object.js";

export const serviceWrapper = <T>(
  serviceFunction: (...args: any[]) => Promise<T>,
  successMessage: string = "Success",
) => {
  return async (req: Request, res: Response) => {
    try {
      const result = await serviceFunction(req, res);

      if (isPaginationWrapper(result)) {
        const response = unwrapPaginationWrapper(result as IPaginationWrapper<any[]>, {
          code: "200",
          messages: successMessage,
          success: true,
        });
        return res.status(200).json(response);
      }

      const response = createResponseObject({
        content: result,
        messages: successMessage,
        code: "200",
        success: true,
      });

      return res.status(200).json(response);
    } catch (error: any) {
      if (error.message) {
        const response = createResponseObject({
          content: null,
          messages: error.message,
          code: "400",
          success: false,
        });
        return res.status(200).json(response);
      }

      const response = createResponseObject({
        content: null,
        messages: "Internal server error",
        code: "500",
        success: false,
      });
      return res.status(500).json(response);
    }
  };
};

function isPaginationWrapper(result: any): boolean {
  return (
    result &&
    typeof result === "object" &&
    "data" in result &&
    "page" in result &&
    "size" in result &&
    "totalPages" in result &&
    "totalElements" in result
  );
}
