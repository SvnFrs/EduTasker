import type { Request, Response } from "express";
import * as CommentService from './comment.service.js';
import type { CreateCommentDTO, CommentListQuery } from './comment.type.js';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const userId = (req as any).user.id;
    const data: CreateCommentDTO = req.body;

    const comment = await CommentService.createComment(projectId, taskId, data, userId);
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listComments = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const userId = (req as any).user.id;
    const query: CommentListQuery = req.query;

    const result = await CommentService.getCommentsByTask(projectId, taskId, query, userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId, commentId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }
    if (!commentId) {
      return res.status(400).json({ error: "Comment ID is required" });
    }

    const userId = (req as any).user.id;
    await CommentService.deleteComment(projectId, taskId, commentId, userId);
    res.json({ message: "Comment deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
