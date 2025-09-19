export interface BoardResponse {
  id: string;
  name: string;
  order: number;
  projectId: string;
  tasks?: TaskSummary[];
  _count?: {
    tasks: number;
  };
}

export interface TaskSummary {
  id: string;
  title: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  order: number;
  dueDate?: Date;
  assignees?: {
    id: string;
    user: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }[];
}

export interface BoardListResponse {
  boards: BoardResponse[];
  total: number;
  projectId: string;
}

export interface CreateBoardDTO {
  name: string;
  order?: number;
  projectId: string;
}

export interface UpdateBoardDTO {
  name?: string;
  order?: number;
}

export interface ReorderBoardDTO {
  boardId: string;
  newOrder: number;
}

export interface BoardQuery {
  includeTasks?: boolean;
  includeTaskCount?: boolean;
}

export interface BoardPermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface BoardWithPermissions extends BoardResponse {
  permissions: BoardPermissions;
}
