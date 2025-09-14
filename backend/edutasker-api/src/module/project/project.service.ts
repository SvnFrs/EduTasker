import { prisma } from '../../config/database.js';
import type {
  AddMemberDTO,
  CreateProjectDTO,
  ProjectListQuery,
  ProjectListResponse,
  ProjectResponse,
  UpdateProjectDTO
} from './project.type.js';

const mapToProjectResponse = (project: any): ProjectResponse => ({
  id: project.id,
  name: project.name,
  description: project.description,
  status: project.status,
  deadline: project.deadline,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  createdBy: project.createdBy ? {
    id: project.createdBy.id,
    name: project.createdBy.name,
    email: project.createdBy.email,
  } : undefined,
  members: project.members?.map((member: any) => ({
    id: member.id,
    role: member.role,
    joinedAt: member.joinedAt,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl ?? undefined,
    }
  })),
  _count: project._count,
});

export const createProject = async (data: CreateProjectDTO, createdById: string): Promise<ProjectResponse> => {
  const project = await prisma.project.create({
    data: {
      ...data,
      createdById,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      _count: {
        select: {
          tasks: true,
          members: true,
        }
      }
    }
  });

  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: createdById,
      role: 'admin'
    }
  });

  return mapToProjectResponse(project);
};

export const getAllProjects = async (query: ProjectListQuery): Promise<ProjectListResponse> => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  let where: any = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.createdBy) {
    where.createdById = query.createdBy;
  }

  if (query.userId) {
    where.members = {
      some: {
        userId: query.userId
      }
    };
  }

  if (query.deadline) {
    const now = new Date();
    switch (query.deadline) {
      case 'upcoming':
        where.deadline = {
          gte: now
        };
        break;
      case 'overdue':
        where.deadline = {
          lt: now
        };
        break;
      case 'this-week':
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + 7);
        where.deadline = {
          gte: now,
          lte: weekEnd
        };
        break;
      case 'this-month':
        const monthEnd = new Date(now);
        monthEnd.setMonth(now.getMonth() + 1);
        where.deadline = {
          gte: now,
          lte: monthEnd
        };
        break;
    }
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.project.count({ where })
  ]);

  return {
    projects: projects.map(mapToProjectResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getProjectById = async (projectId: string, includeMembers = true): Promise<ProjectResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      members: includeMembers ? {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            }
          }
        }
      } : false,
      _count: {
        select: {
          tasks: true,
          members: true,
        }
      }
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return mapToProjectResponse(project);
};

export const updateProject = async (projectId: string, data: UpdateProjectDTO): Promise<ProjectResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.deadline !== undefined && { deadline: data.deadline }),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            }
          }
        }
      },
      _count: {
        select: {
          tasks: true,
          members: true,
        }
      }
    },
  });

  return mapToProjectResponse(updatedProject);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await prisma.project.delete({
    where: { id: projectId }
  });
};

export const addProjectMember = async (projectId: string, data: AddMemberDTO): Promise<ProjectResponse> => {
  const [project, user] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.user.findUnique({ where: { id: data.userId } })
  ]);

  if (!project) {
    throw new Error("Project not found");
  }

  if (!user) {
    throw new Error("User not found");
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: data.userId
      }
    }
  });

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  await prisma.projectMember.create({
    data: {
      projectId,
      userId: data.userId,
      role: data.role || 'member'
    }
  });

  return getProjectById(projectId);
};

export const removeProjectMember = async (projectId: string, userId: string): Promise<void> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  if (!member) {
    throw new Error("User is not a member of this project");
  }

  // Prevent removing the project creator if they are the only admin
  if (project.createdById === userId) {
    const adminCount = await prisma.projectMember.count({
      where: {
        projectId,
        role: 'admin'
      }
    });

    if (adminCount <= 1) {
      throw new Error("Cannot remove the last admin from the project");
    }
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });
};

export const checkProjectMembership = async (projectId: string, userId: string): Promise<{ isMember: boolean; role?: string }> => {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  return {
    isMember: !!member,
    role: member?.role
  };
};
