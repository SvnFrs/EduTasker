import type { Request, Response } from "express";
import * as CommentService from './comment.service.js';
import type { CreateCommentDTO, CommentListQuery } from './comment.type.js';
import { serviceWrapper } from "../../helper/service-wrapper.js";

const createCommentHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const userId = (req as any).user.id;
  const data: CreateCommentDTO = req.body;
  return await CommentService.createComment(projectId, taskId, data, userId);
};

const listCommentsHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const userId = (req as any).user.id;
  const query: CommentListQuery = req.query;
  return await CommentService.getCommentsByTask(projectId, taskId, query, userId);
};

const deleteCommentHandler = async (req: Request, res: Response) => {
  const { projectId, taskId, commentId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }
  if (!commentId) {
    throw new Error("Comment ID is required");
  }

  const userId = (req as any).user.id;
  await CommentService.deleteComment(projectId, taskId, commentId, userId);
  return { message: "Comment deleted successfully" };
};

export const createComment = serviceWrapper(createCommentHandler, "Comment created successfully");
export const listComments = serviceWrapper(listCommentsHandler, "Comments retrieved successfully");
export const deleteComment = serviceWrapper(deleteCommentHandler, "Comment deleted successfully");
