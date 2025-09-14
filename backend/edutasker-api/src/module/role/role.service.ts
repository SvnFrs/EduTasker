import { prisma } from '../../config/database.js';
import type {
  CreateRoleDTO,
  UpdateRoleDTO,
  RoleResponse,
  RoleListQuery,
  RoleListResponse,
  AssignPermissionsDTO,
  PermissionResponse,
  RolePermissionResponse
} from './role.type.js';

const mapToRoleResponse = (role: any): RoleResponse => ({
  id: role.id,
  name: role.name,
  permissions: role.permissions?.map((rp: any) => ({
    id: rp.permission.id,
    name: rp.permission.name,
    action: rp.permission.action,
    pathRegex: rp.permission.pathRegex,
    description: rp.permission.description,
  })),
  _count: role._count,
});

const mapToPermissionResponse = (permission: any): PermissionResponse => ({
  id: permission.id,
  name: permission.name,
  action: permission.action,
  pathRegex: permission.pathRegex,
  description: permission.description,
});

export const createRole = async (data: CreateRoleDTO): Promise<RoleResponse> => {
  // Check if role name already exists
  const existingRole = await prisma.role.findUnique({
    where: { name: data.name }
  });

  if (existingRole) {
    throw new Error("Role name already exists");
  }

  // Verify permissions exist if provided
  if (data.permissionIds && data.permissionIds.length > 0) {
    const permissions = await prisma.permission.findMany({
      where: { id: { in: data.permissionIds } }
    });

    if (permissions.length !== data.permissionIds.length) {
      throw new Error("One or more permissions not found");
    }
  }

  const role = await prisma.role.create({
    data: {
      name: data.name,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        }
      },
      _count: {
        select: {
          users: true,
          permissions: true,
        }
      }
    }
  });

  // Assign permissions if provided
  if (data.permissionIds && data.permissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: data.permissionIds.map(permissionId => ({
        roleId: role.id,
        permissionId
      }))
    });

    // Fetch role with permissions
    const roleWithPermissions = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        permissions: {
          include: {
            permission: true,
          }
        },
        _count: {
          select: {
            users: true,
            permissions: true,
          }
        }
      }
    });

    return mapToRoleResponse(roleWithPermissions);
  }

  return mapToRoleResponse(role);
};

export const getAllRoles = async (query: RoleListQuery): Promise<RoleListResponse> => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;
  const includePermissions = query.includePermissions || false;

  let where: any = {};

  if (query.search) {
    where.name = {
      contains: query.search,
      mode: 'insensitive'
    };
  }

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      include: {
        permissions: includePermissions ? {
          include: {
            permission: true,
          }
        } : false,
        _count: {
          select: {
            users: true,
            permissions: true,
          }
        }
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    }),
    prisma.role.count({ where })
  ]);

  return {
    roles: roles.map(mapToRoleResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getRoleById = async (roleId: string): Promise<RoleResponse> => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      permissions: {
        include: {
          permission: true,
        }
      },
      _count: {
        select: {
          users: true,
          permissions: true,
        }
      }
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  return mapToRoleResponse(role);
};

export const updateRole = async (roleId: string, data: UpdateRoleDTO): Promise<RoleResponse> => {
  const role = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!role) {
    throw new Error("Role not found");
  }

  // Check if new name already exists (if name is being updated)
  if (data.name && data.name !== role.name) {
    const existingRole = await prisma.role.findUnique({
      where: { name: data.name }
    });

    if (existingRole) {
      throw new Error("Role name already exists");
    }
  }

  const updatedRole = await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(data.name && { name: data.name }),
    },
    include: {
      permissions: {
        include: {
          permission: true,
        }
      },
      _count: {
        select: {
          users: true,
          permissions: true,
        }
      }
    },
  });

  return mapToRoleResponse(updatedRole);
};

export const deleteRole = async (roleId: string): Promise<void> => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      _count: {
        select: {
          users: true,
        }
      }
    }
  });

  if (!role) {
    throw new Error("Role not found");
  }

  // Prevent deletion if role has assigned users
  if (role._count.users > 0) {
    throw new Error("Cannot delete role that has assigned users");
  }

  await prisma.role.delete({
    where: { id: roleId }
  });
};

export const assignPermissionsToRole = async (roleId: string, data: AssignPermissionsDTO): Promise<RolePermissionResponse> => {
  const role = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!role) {
    throw new Error("Role not found");
  }

  // Verify all permissions exist
  const permissions = await prisma.permission.findMany({
    where: { id: { in: data.permissionIds } }
  });

  if (permissions.length !== data.permissionIds.length) {
    throw new Error("One or more permissions not found");
  }

  // Remove existing permissions and add new ones
  await prisma.rolePermission.deleteMany({
    where: { roleId }
  });

  await prisma.rolePermission.createMany({
    data: data.permissionIds.map(permissionId => ({
      roleId,
      permissionId
    }))
  });

  // Fetch updated role with permissions
  const updatedRole = await getRoleById(roleId);

  // Get all available permissions
  const allPermissions = await prisma.permission.findMany({
    orderBy: { name: 'asc' }
  });

  return {
    role: updatedRole,
    assignedPermissions: updatedRole.permissions || [],
    availablePermissions: allPermissions.map(mapToPermissionResponse)
  };
};

export const getAllPermissions = async (): Promise<PermissionResponse[]> => {
  const permissions = await prisma.permission.findMany({
    orderBy: { name: 'asc' }
  });

  return permissions.map(mapToPermissionResponse);
};
