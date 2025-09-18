export interface RoleResponse {
  id: string;
  name: string;
  code: string;
  _count?: {
    users: number;
  };
}

export interface CreateRoleDTO {
  name: string;
  code: string;
}

export interface UpdateRoleDTO {
  name?: string;
  code?: string;
}

export interface RoleListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface RoleListResponse {
  roles: RoleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
