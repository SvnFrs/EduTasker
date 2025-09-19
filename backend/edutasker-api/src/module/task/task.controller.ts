import type { Request, Response } from "express";
import * as TaskService from "./task.service.js";
import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskListQuery,
  AssignTaskDTO,
  UpdateTaskStatusDTO,
  MoveTaskDTO,
} from "./task.type.js";
import { serviceWrapper } from "../../helper/service-wrapper.js";

const createTaskHandler = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const userId = (req as any).user.id;
  const data: CreateTaskDTO = req.body;
  return await TaskService.createTask(projectId, data, userId);
};

const listTasksHandler = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const userId = (req as any).user.id;
  const query: TaskListQuery = req.query;
  return await TaskService.getTasksByProject(projectId, query, userId);
};

const getTaskByIdHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const userId = (req as any).user.id;
  return await TaskService.getTaskById(projectId, taskId, userId);
};

const updateTaskHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const userId = (req as any).user.id;
  const data: UpdateTaskDTO = req.body;
  return await TaskService.updateTask(projectId, taskId, data, userId);
};

const deleteTaskHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const userId = (req as any).user.id;
  await TaskService.deleteTask(projectId, taskId, userId);
  return { message: "Task deleted successfully" };
};

const assignTaskHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const userId = (req as any).user.id;
  const data: AssignTaskDTO = req.body;
  return await TaskService.assignUsersToTask(projectId, taskId, data, userId);
};

const updateTaskStatusHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const userId = (req as any).user.id;
  const data: UpdateTaskStatusDTO = req.body;
  return await TaskService.updateTaskStatus(projectId, taskId, data, userId);
};

const moveTaskHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  const userId = (req as any).user.id;
  const data: MoveTaskDTO = req.body;
  return await TaskService.moveTask(projectId, taskId, data, userId);
};

export const createTask = serviceWrapper(createTaskHandler, "Task created successfully");
export const listTasks = serviceWrapper(listTasksHandler, "Tasks retrieved successfully");
export const getTaskById = serviceWrapper(getTaskByIdHandler, "Task retrieved successfully");
export const updateTask = serviceWrapper(updateTaskHandler, "Task updated successfully");
export const deleteTask = serviceWrapper(deleteTaskHandler, "Task deleted successfully");
export const assignTask = serviceWrapper(assignTaskHandler, "Task assigned successfully");
export const updateTaskStatus = serviceWrapper(
  updateTaskStatusHandler,
  "Task status updated successfully",
);
export const moveTask = serviceWrapper(moveTaskHandler, "Task moved successfully");
