import { prisma } from "../../config/database.js";
import type {
  CommentListQuery,
  CommentListResponse,
  CommentResponse,
  CreateCommentDTO,
} from "./comment.type.js";

const mapToCommentResponse = (comment: any): CommentResponse => ({
  id: comment.id,
  content: comment.content,
  createdAt: comment.createdAt,
  task: {
    id: comment.task.id,
    title: comment.task.title,
  },
  user: {
    id: comment.user.id,
    name: comment.user.name,
    email: comment.user.email,
    avatarUrl: comment.user.avatarUrl ?? undefined,
  },
});

export const createComment = async (
  projectId: string,
  taskId: string,
  data: CreateCommentDTO,
  userId: string,
): Promise<CommentResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId },
      },
    },
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
      projectId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      taskId,
      userId,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return mapToCommentResponse(comment);
};

export const getCommentsByTask = async (
  projectId: string,
  taskId: string,
  query: CommentListQuery,
  userId: string,
): Promise<CommentListResponse> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId },
      },
    },
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
      projectId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;
  const sortOrder = query.sortOrder || "asc";

  const where = { taskId };

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    comments: comments.map(mapToCommentResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const deleteComment = async (
  projectId: string,
  taskId: string,
  commentId: string,
  userId: string,
): Promise<void> => {
  // Verify project exists and user has access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId },
      },
    },
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
      projectId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
      taskId,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  const isCommentAuthor = comment.userId === userId;
  const isProjectAdmin = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
      role: "admin",
    },
  });

  if (!isCommentAuthor && !isProjectAdmin) {
    throw new Error("You can only delete your own comments or you must be a project admin");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });
};
