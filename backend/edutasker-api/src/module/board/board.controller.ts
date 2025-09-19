import type { Request, Response } from "express";
import * as BoardService from "./board.service.js";
import type { CreateBoardDTO, UpdateBoardDTO, ReorderBoardDTO, BoardQuery } from "./board.type.js";
import { serviceWrapper } from "../../helper/service-wrapper.js";

const createBoardHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data: CreateBoardDTO = req.body;
  return await BoardService.createBoard(data, userId);
};

const getBoardByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  if (!id) {
    throw new Error("Board ID is required");
  }

  const query: BoardQuery = {
    includeTasks: req.query.includeTasks === "true",
    includeTaskCount: req.query.includeTaskCount === "true",
  };

  return await BoardService.getBoardById(id, userId, query);
};

const getProjectBoardsHandler = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = (req as any).user.id;

  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const query: BoardQuery = {
    includeTasks: req.query.includeTasks === "true",
    includeTaskCount: req.query.includeTaskCount === "true",
  };

  return await BoardService.getProjectBoards(projectId, userId, query);
};

const updateBoardHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  if (!id) {
    throw new Error("Board ID is required");
  }

  const data: UpdateBoardDTO = req.body;
  return await BoardService.updateBoard(id, data, userId);
};

const deleteBoardHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  if (!id) {
    throw new Error("Board ID is required");
  }

  await BoardService.deleteBoard(id, userId);
  return { message: "Board deleted successfully" };
};

const reorderBoardsHandler = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = (req as any).user.id;

  if (!projectId) {
    throw new Error("Project ID is required");
  }

  console.log(req.body);

  const reorderData: ReorderBoardDTO[] = req.body.boards;

  if (!Array.isArray(reorderData)) {
    throw new Error("Invalid reorder data. Expected array of boards.");
  }

  return await BoardService.reorderBoards(projectId, reorderData, userId);
};

const getBoardStatsHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  if (!id) {
    throw new Error("Board ID is required");
  }

  return await BoardService.getBoardStats(id, userId);
};

export const createBoard = serviceWrapper(createBoardHandler, "Board created successfully");
export const getBoardById = serviceWrapper(getBoardByIdHandler, "Board retrieved successfully");
export const getProjectBoards = serviceWrapper(
  getProjectBoardsHandler,
  "Project boards retrieved successfully",
);
export const updateBoard = serviceWrapper(updateBoardHandler, "Board updated successfully");
export const deleteBoard = serviceWrapper(deleteBoardHandler, "Board deleted successfully");
export const reorderBoards = serviceWrapper(reorderBoardsHandler, "Boards reordered successfully");
export const getBoardStats = serviceWrapper(
  getBoardStatsHandler,
  "Board stats retrieved successfully",
);
