import type { TaskPriority } from "@prisma/client";

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
  };
  board: {
    id: string;
    name: string;
    order: number;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  assignees?: TaskAssigneeResponse[];
  _count?: {
    comments: number;
  };
}

export interface TaskAssigneeResponse {
  id: string;
  assignedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate?: Date;
  boardId: string;
  order?: number;
  assigneeIds?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate?: Date;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedTo?: string;
  createdBy?: string;
  boardId?: string;
  dueDate?: "upcoming" | "overdue" | "today" | "this-week";
  sortBy?: "createdAt" | "dueDate" | "priority" | "title" | "order";
  sortOrder?: "asc" | "desc";
}

export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssignTaskDTO {
  userIds: string[];
}

export interface UpdateTaskStatusDTO {
  status: string;
}

export interface MoveTaskDTO {
  boardId: string;
  order: number;
}

export interface BoardResponse {
  id: string;
  name: string;
  order: number;
  tasks?: TaskResponse[];
}

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  doingTasks: number;
  doneTasks: number;
  overdueTasks: number;
}
