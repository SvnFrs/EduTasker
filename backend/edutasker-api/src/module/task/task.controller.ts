import type { Request, Response } from "express";
import * as TaskService from './task.service.js';
import type { CreateTaskDTO, UpdateTaskDTO, TaskListQuery, AssignTaskDTO, UpdateTaskStatusDTO } from './task.type.js';

export const createTask = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const userId = (req as any).user.id;
    const data: CreateTaskDTO = req.body;

    const task = await TaskService.createTask(projectId, data, userId);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const userId = (req as any).user.id;
    const query: TaskListQuery = req.query;

    const result = await TaskService.getTasksByProject(projectId, query, userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const userId = (req as any).user.id;
    const task = await TaskService.getTaskById(projectId, taskId, userId);
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const userId = (req as any).user.id;
    const data: UpdateTaskDTO = req.body;

    const updatedTask = await TaskService.updateTask(projectId, taskId, data, userId);
    res.json(updatedTask);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const userId = (req as any).user.id;
    await TaskService.deleteTask(projectId, taskId, userId);
    res.json({ message: "Task deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const assignTask = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const userId = (req as any).user.id;
    const data: AssignTaskDTO = req.body;

    const updatedTask = await TaskService.assignUsersToTask(projectId, taskId, data, userId);
    res.json(updatedTask);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const userId = (req as any).user.id;
    const data: UpdateTaskStatusDTO = req.body;

    const updatedTask = await TaskService.updateTaskStatus(projectId, taskId, data, userId);
    res.json(updatedTask);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
