import { prisma } from "../../config/database.js";
import type {
  CreateRoleDTO,
  RoleListQuery,
  RoleListResponse,
  RoleResponse,
  UpdateRoleDTO,
} from "./role.type.js";

const mapToRoleResponse = (role: any): RoleResponse => ({
  id: role.id,
  name: role.name,
  code: role.code,
  _count: role._count,
});

export const createRole = async (data: CreateRoleDTO): Promise<RoleResponse> => {
  const existingRole = await prisma.role.findFirst({
    where: {
      OR: [{ name: data.name }, { code: data.code }],
    },
  });

  if (existingRole) {
    throw new Error("Role name or code already exists");
  }

  const role = await prisma.role.create({
    data: {
      name: data.name,
      code: data.code,
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  return mapToRoleResponse(role);
};

export const getAllRoles = async (query: RoleListQuery): Promise<RoleListResponse> => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  let where: any = {};

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        code: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.role.count({ where }),
  ]);

  return {
    roles: roles.map(mapToRoleResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getRoleById = async (roleId: string): Promise<RoleResponse> => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  return mapToRoleResponse(role);
};

export const updateRole = async (roleId: string, data: UpdateRoleDTO): Promise<RoleResponse> => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  // Check for name conflicts
  if (data.name && data.name !== role.name) {
    const existingRole = await prisma.role.findFirst({
      where: {
        name: data.name,
        id: { not: roleId },
      },
    });

    if (existingRole) {
      throw new Error("Role name already exists");
    }
  }

  // Check for code conflicts
  if (data.code && data.code !== role.code) {
    const existingRole = await prisma.role.findFirst({
      where: {
        code: data.code,
        id: { not: roleId },
      },
    });

    if (existingRole) {
      throw new Error("Role code already exists");
    }
  }

  const updatedRole = await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.code && { code: data.code }),
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
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
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  if (role._count.users > 0) {
    throw new Error("Cannot delete role that has assigned users");
  }

  await prisma.role.delete({
    where: { id: roleId },
  });
};
