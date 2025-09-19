import { prisma } from "../../config/database.js";
import type {
  AddMemberDTO,
  AddMentorDTO,
  BoardResponse,
  CreateBoardDTO,
  CreateProjectDTO,
  ProjectListQuery,
  ProjectListResponse,
  ProjectResponse,
  UpdateBoardDTO,
  UpdateProjectDTO,
} from "./project.type.js";

const mapToProjectResponse = (project: any): ProjectResponse => ({
  id: project.id,
  name: project.name,
  description: project.description,
  status: project.status,
  deadline: project.deadline,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  createdBy: project.createdBy
    ? {
        id: project.createdBy.id,
        name: project.createdBy.name,
        email: project.createdBy.email,
      }
    : undefined,
  members: project.members?.map((member: any) => ({
    id: member.id,
    role: member.role as "LEADER" | "MEMBER",
    joinedAt: member.joinedAt,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl ?? undefined,
    },
  })),
  mentors: project.ProjectMentor?.map((mentor: any) => ({
    id: mentor.id,
    role: mentor.role,
    joinedAt: mentor.joinedAt,
    user: {
      id: mentor.user.id,
      name: mentor.user.name,
      email: mentor.user.email,
      avatarUrl: mentor.user.avatarUrl ?? undefined,
    },
  })),
  boards: project.Board?.map((board: any) => ({
    id: board.id,
    name: board.name,
    order: board.order,
    projectId: board.projectId,
  })),
  _count: project._count,
});

export const createProject = async (
  data: CreateProjectDTO,
  createdById: string,
): Promise<ProjectResponse> => {
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
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
  });

  // Automatically add creator as leader member
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: createdById,
      role: "LEADER",
    },
  });

  // Create default boards
  await prisma.board.createMany({
    data: [
      { name: "To Do", order: 0, projectId: project.id },
      { name: "In Progress", order: 1, projectId: project.id },
      { name: "Done", order: 2, projectId: project.id },
    ],
  });

  return mapToProjectResponse(project);
};

export const getAllProjects = async (query: ProjectListQuery): Promise<ProjectListResponse> => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  let where: any = {};
  console.log(query);
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
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
        userId: query.userId,
      },
    };
  }

  if (query.deadline) {
    const now = new Date();
    switch (query.deadline) {
      case "upcoming":
        where.deadline = {
          gte: now,
        };
        break;
      case "overdue":
        where.deadline = {
          lt: now,
        };
        break;
      case "this-week":
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + 7);
        where.deadline = {
          gte: now,
          lte: weekEnd,
        };
        break;
      case "this-month":
        const monthEnd = new Date(now);
        monthEnd.setMonth(now.getMonth() + 1);
        where.deadline = {
          gte: now,
          lte: monthEnd,
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
          },
        },
        Board: true,
        ProjectMentor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
            Board: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects: projects.map(mapToProjectResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getProjectById = async (
  projectId: string,
  includeMembers = true,
): Promise<ProjectResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: includeMembers
        ? {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          }
        : false,
      Board: true,
      ProjectMentor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
          Board: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return mapToProjectResponse(project);
};

export const updateProject = async (
  projectId: string,
  data: UpdateProjectDTO,
): Promise<ProjectResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
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
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      Board: true,
      ProjectMentor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
          Board: true,
        },
      },
    },
  });

  return mapToProjectResponse(updatedProject);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
};

export const addProjectMember = async (
  projectId: string,
  data: AddMemberDTO,
): Promise<ProjectResponse> => {
  const [project, user] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.user.findUnique({ where: { id: data.userId } }),
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
        userId: data.userId,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  await prisma.projectMember.create({
    data: {
      projectId,
      userId: data.userId,
      role: data.role || "MEMBER",
    },
  });

  return getProjectById(projectId);
};

export const removeProjectMember = async (projectId: string, userId: string): Promise<void> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("User is not a member of this project");
  }

  // Prevent removing the project creator if they are the only leader
  if (project.createdById === userId) {
    const leaderCount = await prisma.projectMember.count({
      where: {
        projectId,
        role: "LEADER",
      },
    });

    if (leaderCount <= 1) {
      throw new Error("Cannot remove the last leader from the project");
    }
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
};

export const checkProjectMembership = async (
  projectId: string,
  userId: string,
): Promise<{ isMember: boolean; role?: string }> => {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  return {
    isMember: !!member,
    role: member?.role,
  };
};

export const addProjectMentor = async (
  projectId: string,
  data: AddMentorDTO,
): Promise<ProjectResponse> => {
  const [project, user] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.user.findUnique({ where: { id: data.userId } }),
  ]);

  if (!project) {
    throw new Error("Project not found");
  }

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is already a mentor
  const existingMentor = await prisma.projectMentor.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: data.userId,
      },
    },
  });

  if (existingMentor) {
    throw new Error("User is already a mentor of this project");
  }

  await prisma.projectMentor.create({
    data: {
      projectId,
      userId: data.userId,
      role: data.role || "mentor",
    },
  });

  return getProjectById(projectId);
};

export const removeProjectMentor = async (projectId: string, userId: string): Promise<void> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const mentor = await prisma.projectMentor.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!mentor) {
    throw new Error("User is not a mentor of this project");
  }

  await prisma.projectMentor.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
};

export const createBoard = async (
  projectId: string,
  data: CreateBoardDTO,
): Promise<BoardResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Get next order if not specified
  let boardOrder = data.order;
  if (boardOrder === undefined) {
    const lastBoard = await prisma.board.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
    });
    boardOrder = (lastBoard?.order || 0) + 1;
  }

  const board = await prisma.board.create({
    data: {
      name: data.name,
      order: boardOrder,
      projectId,
    },
  });

  return {
    id: board.id,
    name: board.name,
    order: board.order,
    projectId: board.projectId,
  };
};

export const updateBoard = async (
  boardId: string,
  data: UpdateBoardDTO,
): Promise<BoardResponse> => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  const updatedBoard = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });

  return {
    id: updatedBoard.id,
    name: updatedBoard.name,
    order: updatedBoard.order,
    projectId: updatedBoard.projectId,
  };
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  if (board._count.tasks > 0) {
    throw new Error("Cannot delete board that contains tasks");
  }

  await prisma.board.delete({
    where: { id: boardId },
  });
};

export const getMyProjects = async (
  userId: string,
  query?: Partial<ProjectListQuery>,
): Promise<ProjectListResponse> => {
  const page = query?.page || 1;
  const limit = query?.limit || 10;
  const skip = (page - 1) * limit;

  let where: any = {
    OR: [
      { createdById: userId },
      {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      {
        ProjectMentor: {
          some: {
            userId: userId,
          },
        },
      },
    ],
  };

  if (query?.search) {
    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ],
    });
  }

  if (query?.status) {
    where.AND = where.AND || [];
    where.AND.push({ status: query.status });
  }

  if (query?.deadline) {
    const now = new Date();
    let deadlineCondition: any = {};

    switch (query.deadline) {
      case "upcoming":
        deadlineCondition = { gte: now };
        break;
      case "overdue":
        deadlineCondition = { lt: now };
        break;
      case "this-week":
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + 7);
        deadlineCondition = { gte: now, lte: weekEnd };
        break;
      case "this-month":
        const monthEnd = new Date(now);
        monthEnd.setMonth(now.getMonth() + 1);
        deadlineCondition = { gte: now, lte: monthEnd };
        break;
    }

    where.AND = where.AND || [];
    where.AND.push({ deadline: deadlineCondition });
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
          },
        },
        Board: true,
        ProjectMentor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
            Board: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects: projects.map(mapToProjectResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getProjectBoards = async (projectId: string): Promise<BoardResponse[]> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const boards = await prisma.board.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  return boards.map((board) => ({
    id: board.id,
    name: board.name,
    order: board.order,
    projectId: board.projectId,
  }));
};
