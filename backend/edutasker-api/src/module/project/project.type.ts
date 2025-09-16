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
  mentors?: ProjectMentorResponse[];
  boards?: BoardResponse[];
  _count?: {
    tasks: number;
    members: number;
    mentors: number;
    boards: number;
  };
}

export interface ProjectMemberResponse {
  id: string;
  role: "LEADER" | "MEMBER";
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface ProjectMentorResponse {
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

export interface BoardResponse {
  id: string;
  name: string;
  order: number;
  projectId: string;
}

export interface ProjectPermissionResponse {
  id: string;
  action: "READ" | "CREATE" | "UPDATE" | "DELETE";
  resource: string;
  user: {
    id: string;
    name: string;
    email: string;
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
  deadline?: "upcoming" | "overdue" | "this-week" | "this-month";
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
  role?: "LEADER" | "MEMBER";
}

export interface AddMentorDTO {
  userId: string;
  role?: string;
}

export interface CreateBoardDTO {
  name: string;
  order?: number;
}

export interface UpdateBoardDTO {
  name?: string;
  order?: number;
}

export interface AssignPermissionDTO {
  userId: string;
  action: "READ" | "CREATE" | "UPDATE" | "DELETE";
  resource: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
}

export enum ProjectRole {
  MEMBER = "MEMBER",
  MENTOR = "MENTOR",
  ADMIN = "ADMIN",
}

export enum ProjectAction {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}
