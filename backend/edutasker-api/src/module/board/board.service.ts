import { prisma } from "../../config/database.js";
import {
  adjustOrderForDeletedItem,
  adjustOrderForNewItem,
  getNextOrderNumber,
  reorderMultipleItems,
  reorderSingleItem,
} from "../../helper/reorder.util.js";
import type {
  BoardListResponse,
  BoardPermissions,
  BoardQuery,
  BoardResponse,
  BoardWithPermissions,
  CreateBoardDTO,
  ReorderBoardDTO,
  UpdateBoardDTO,
} from "./board.type.js";

const mapToBoardResponse = (board: any): BoardResponse => {
  return {
    id: board.id,
    name: board.name,
    order: board.order,
    projectId: board.projectId,
    tasks: board.tasks?.map((task: any) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      order: task.order,
      dueDate: task.dueDate,
      assignees: task.assignees?.map((assignee: any) => ({
        id: assignee.id,
        user: {
          id: assignee.user.id,
          name: assignee.user.name,
          avatarUrl: assignee.user.avatarUrl,
        },
      })),
    })),
    _count: board._count,
  };
};

const checkProjectAccess = async (projectId: string, userId: string): Promise<boolean> => {
  const access = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { createdById: userId },
        { members: { some: { userId } } },
        { ProjectMentor: { some: { userId } } },
      ],
    },
  });
  return !!access;
};

const checkBoardAccess = async (boardId: string, userId: string): Promise<boolean> => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      project: {
        OR: [
          { createdById: userId },
          { members: { some: { userId } } },
          { ProjectMentor: { some: { userId } } },
        ],
      },
    },
  });
  return !!board;
};

const getBoardPermissions = async (boardId: string, userId: string): Promise<BoardPermissions> => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
    },
    include: {
      project: {
        include: {
          members: {
            where: { userId },
          },
          ProjectMentor: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!board) {
    return { canRead: false, canCreate: false, canUpdate: false, canDelete: false };
  }

  const isOwner = board.project.createdById === userId;
  const isMember = board.project.members.length > 0;
  const isMentor = board.project.ProjectMentor.length > 0;
  const hasAccess = isOwner || isMember || isMentor;

  return {
    canRead: hasAccess,
    canCreate: isOwner || isMember,
    canUpdate: isOwner || isMember,
    canDelete: isOwner,
  };
};

export const createBoard = async (data: CreateBoardDTO, userId: string): Promise<BoardResponse> => {
  const hasAccess = await checkProjectAccess(data.projectId, userId);
  if (!hasAccess) {
    throw new Error("Access denied. You are not a member of this project.");
  }
  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }
  let boardOrder = data.order;
  if (boardOrder === undefined) {
    boardOrder = await getNextOrderNumber(data.projectId, "board");
  } else {
    await adjustOrderForNewItem(boardOrder, data.projectId, "board");
  }

  const board = await prisma.board.create({
    data: {
      name: data.name,
      order: boardOrder,
      projectId: data.projectId,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  return mapToBoardResponse(board);
};

export const getBoardById = async (
  boardId: string,
  userId: string,
  query?: BoardQuery,
): Promise<BoardWithPermissions> => {
  const hasAccess = await checkBoardAccess(boardId, userId);
  if (!hasAccess) {
    throw new Error("Access denied. You don't have permission to view this board.");
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      ...(query?.includeTasks && {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            assignees: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      }),
      ...(query?.includeTaskCount && {
        _count: {
          select: {
            tasks: true,
          },
        },
      }),
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  const permissions = await getBoardPermissions(boardId, userId);

  return {
    ...mapToBoardResponse(board),
    permissions,
  };
};

export const getProjectBoards = async (
  projectId: string,
  userId: string,
  query?: BoardQuery,
): Promise<BoardListResponse> => {
  const hasAccess = await checkProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new Error("Access denied. You are not a member of this project.");
  }

  const boards = await prisma.board.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: {
      ...(query?.includeTasks && {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            assignees: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      }),
      ...(query?.includeTaskCount && {
        _count: {
          select: {
            tasks: true,
          },
        },
      }),
    },
  });

  const mappedBoards = boards.map(mapToBoardResponse);

  return {
    boards: mappedBoards,
    total: mappedBoards.length,
    projectId,
  };
};

export const updateBoard = async (
  boardId: string,
  data: UpdateBoardDTO,
  userId: string,
): Promise<BoardResponse> => {
  const hasAccess = await checkBoardAccess(boardId, userId);
  if (!hasAccess) {
    throw new Error("Access denied. You don't have permission to update this board.");
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  if (data.order !== undefined && data.order !== board.order) {
    await reorderSingleItem({
      itemId: boardId,
      newOrder: data.order,
      projectId: board.projectId,
      tableName: "board",
    });
  }

  const updatedBoard = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.order !== undefined && { order: data.order }),
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  return mapToBoardResponse(updatedBoard);
};

export const deleteBoard = async (boardId: string, userId: string): Promise<void> => {
  const hasAccess = await checkBoardAccess(boardId, userId);
  if (!hasAccess) {
    throw new Error("Access denied. You don't have permission to delete this board.");
  }

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
    throw new Error(
      "Cannot delete board that contains tasks. Please move or delete all tasks first.",
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: board.projectId,
      createdById: userId,
    },
  });

  if (!project) {
    throw new Error("Access denied. Only project owners can delete boards.");
  }

  await prisma.board.delete({
    where: { id: boardId },
  });

  await adjustOrderForDeletedItem(board.order, board.projectId, "board");
};

export const reorderBoards = async (
  projectId: string,
  reorderData: ReorderBoardDTO[],
  userId: string,
): Promise<BoardListResponse> => {
  const hasAccess = await checkProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new Error("Access denied. You are not a member of this project.");
  }

  const reorderItems = reorderData.map((item) => ({
    id: item.boardId,
    newOrder: item.newOrder,
  }));

  await reorderMultipleItems({
    items: reorderItems,
    projectId,
    tableName: "board",
  });

  return getProjectBoards(projectId, userId);
};

export const getBoardStats = async (boardId: string, userId: string) => {
  const hasAccess = await checkBoardAccess(boardId, userId);
  if (!hasAccess) {
    throw new Error("Access denied. You don't have permission to view this board.");
  }

  const stats = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
      tasks: {
        select: {
          status: true,
          priority: true,
        },
      },
    },
  });

  if (!stats) {
    throw new Error("Board not found");
  }

  const tasksByStatus = stats.tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const tasksByPriority = stats.tasks.reduce(
    (acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    id: stats.id,
    name: stats.name,
    totalTasks: stats._count.tasks,
    tasksByStatus,
    tasksByPriority,
  };
};
