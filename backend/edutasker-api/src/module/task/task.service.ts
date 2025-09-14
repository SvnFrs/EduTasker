import { prisma } from '../../config/database.js';
import type {
  AssignTaskDTO,
  CreateTaskDTO,
  TaskListQuery,
  TaskListResponse,
  TaskResponse,
  UpdateTaskDTO,
  UpdateTaskStatusDTO
} from './task.type.js';

const mapToTaskResponse = (task: any): TaskResponse => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  project: {
    id: task.project.id,
    name: task.project.name,
  },
  createdBy: task.createdBy ? {
    id: task.createdBy.id,
    name: task.createdBy.name,
    email: task.createdBy.email,
  } : undefined,
  assignees: task.assignees?.map((assignee: any) => ({
    id: assignee.id,
    assignedAt: assignee.assignedAt,
    user: {
      id: assignee.user.id,
      name: assignee.user.name,
      email: assignee.user.email,
      avatarUrl: assignee.user.avatarUrl ?? undefined,
    }
  })),
  _count: task._count,
});

export const createTask = async (
  projectId: string,
  data: CreateTaskDTO,
  createdById: string
): Promise<TaskResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId: createdById }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.members.length === 0) {
    throw new Error("You are not a member of this project");
  }

  if (data.assigneeIds && data.assigneeIds.length > 0) {
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
        userId: { in: data.assigneeIds }
      }
    });

    if (projectMembers.length !== data.assigneeIds.length) {
      throw new Error("One or more assignees are not members of this project");
    }
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      projectId,
      createdById,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      _count: {
        select: {
          comments: true,
        }
      }
    }
  });

  if (data.assigneeIds && data.assigneeIds.length > 0) {
    await prisma.taskAssignee.createMany({
      data: data.assigneeIds.map(userId => ({
        taskId: task.id,
        userId
      }))
    });

    const taskWithAssignees = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        assignees: {
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
            comments: true,
          }
        }
      }
    });

    return mapToTaskResponse(taskWithAssignees);
  }

  return mapToTaskResponse(task);
};

export const getTasksByProject = async (
  projectId: string,
  query: TaskListQuery,
  userId: string
): Promise<TaskListResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.members.length === 0) {
    throw new Error("You are not a member of this project");
  }

  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  let where: any = { projectId };

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.assignedTo) {
    where.assignees = {
      some: {
        userId: query.assignedTo
      }
    };
  }

  if (query.createdBy) {
    where.createdById = query.createdBy;
  }

  if (query.dueDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (query.dueDate) {
      case 'today':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        where.dueDate = {
          gte: today,
          lt: tomorrow
        };
        break;
      case 'upcoming':
        where.dueDate = {
          gte: now
        };
        break;
      case 'overdue':
        where.dueDate = {
          lt: now
        };
        where.status = {
          not: 'done'
        };
        break;
      case 'this-week':
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        where.dueDate = {
          gte: today,
          lt: weekEnd
        };
        break;
    }
  }

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  let orderBy: any = {};
  if (sortBy === 'priority') {
    // Custom priority ordering: urgent > high > medium > low
    orderBy = {
      priority: {
        sort: sortOrder,
        nulls: 'last'
      }
    };
  } else {
    orderBy[sortBy] = sortOrder;
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        assignees: {
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
            comments: true,
          }
        }
      },
      skip,
      take: limit,
      orderBy
    }),
    prisma.task.count({ where })
  ]);

  return {
    tasks: tasks.map(mapToTaskResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getTaskById = async (
  projectId: string,
  taskId: string,
  userId: string
): Promise<TaskResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.members.length === 0) {
    throw new Error("You are not a member of this project");
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      projectId
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      assignees: {
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
          comments: true,
        }
      }
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return mapToTaskResponse(task);
};

export const updateTask = async (
  projectId: string,
  taskId: string,
  data: UpdateTaskDTO,
  userId: string
): Promise<TaskResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.members.length === 0) {
    throw new Error("You are not a member of this project");
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      projectId
    }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      assignees: {
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
          comments: true,
        }
      }
    },
  });

  return mapToTaskResponse(updatedTask);
};

export const deleteTask = async (
  projectId: string,
  taskId: string,
  userId: string
): Promise<void> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.members.length === 0) {
    throw new Error("You are not a member of this project");
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      projectId
    }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  await prisma.task.delete({
    where: { id: taskId }
  });
};

export const assignUsersToTask = async (
  projectId: string,
  taskId: string,
  data: AssignTaskDTO,
  userId: string
): Promise<TaskResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.members.length === 0) {
    throw new Error("You are not a member of this project");
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      projectId
    }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const projectMembers = await prisma.projectMember.findMany({
    where: {
      projectId,
      userId: { in: data.userIds }
    }
  });

  if (projectMembers.length !== data.userIds.length) {
    throw new Error("One or more users are not members of this project");
  }

  await prisma.taskAssignee.deleteMany({
    where: { taskId }
  });

  await prisma.taskAssignee.createMany({
    data: data.userIds.map(userId => ({
      taskId,
      userId
    }))
  });

  return getTaskById(projectId, taskId, userId);
};

export const updateTaskStatus = async (
  projectId: string,
  taskId: string,
  data: UpdateTaskStatusDTO,
  userId: string
): Promise<TaskResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.members.length === 0) {
    throw new Error("You are not a member of this project");
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      projectId
    }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: data.status },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      assignees: {
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
          comments: true,
        }
      }
    },
  });

  return mapToTaskResponse(updatedTask);
};
