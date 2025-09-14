export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  status: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  members?: ProjectMemberResponse[];
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface ProjectMemberResponse {
  id: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  status?: string;
  deadline?: Date;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: string;
  deadline?: Date;
}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  createdBy?: string;
  userId?: string;
  deadline?: 'upcoming' | 'overdue' | 'this-week' | 'this-month';
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddMemberDTO {
  userId: string;
  role?: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
}
