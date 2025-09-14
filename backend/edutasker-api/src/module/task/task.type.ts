export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
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
  priority?: string;
  dueDate?: Date;
  assigneeIds?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  createdBy?: string;
  dueDate?: 'upcoming' | 'overdue' | 'today' | 'this-week';
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
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

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  doingTasks: number;
  doneTasks: number;
  overdueTasks: number;
}
