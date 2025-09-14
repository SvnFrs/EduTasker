export interface RoleResponse {
  id: string;
  name: string;
  permissions?: PermissionResponse[];
  _count?: {
    users: number;
    permissions: number;
  };
}

export interface PermissionResponse {
  id: string;
  name: string;
  action: string;
  pathRegex: string;
  description?: string;
}

export interface CreateRoleDTO {
  name: string;
  permissionIds?: string[];
}

export interface UpdateRoleDTO {
  name?: string;
}

export interface RoleListQuery {
  page?: number;
  limit?: number;
  search?: string;
  includePermissions?: boolean;
}

export interface RoleListResponse {
  roles: RoleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssignPermissionsDTO {
  permissionIds: string[];
}

export interface RolePermissionResponse {
  role: RoleResponse;
  assignedPermissions: PermissionResponse[];
  availablePermissions: PermissionResponse[];
}
