import { prisma } from "../../config/database.js";
import type {
  CreateMentorDTO,
  MentorListQuery,
  MentorListResponse,
  MentorResponse,
  MentorWithProjectsResponse,
  UpdateMentorByIdDTO,
  UpdateMentorDTO,
} from "./mentor.type.js";

const mapToMentorResponse = (mentor: {
  id: string;
  userId: string;
  expertise: string | null;
  bio: string | null;
  verified: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}): MentorResponse => ({
  id: mentor.id,
  userId: mentor.userId,
  expertise: mentor.expertise ?? undefined,
  bio: mentor.bio ?? undefined,
  verified: mentor.verified,
  user: {
    id: mentor.user.id,
    name: mentor.user.name,
    email: mentor.user.email,
    avatarUrl: mentor.user.avatarUrl ?? undefined,
  },
});

export const createMentor = async (data: CreateMentorDTO): Promise<MentorResponse> => {
  const userExists = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!userExists) {
    throw new Error("User not found");
  }

  const existingMentor = await prisma.mentor.findUnique({
    where: { userId: data.userId },
  });

  if (existingMentor) {
    throw new Error("User is already a mentor");
  }

  const mentor = await prisma.mentor.create({
    data: {
      userId: data.userId,
      expertise: data.expertise,
      bio: data.bio,
    },
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
  });

  return mapToMentorResponse(mentor);
};

export const getMentorById = async (id: string): Promise<MentorResponse> => {
  const mentor = await prisma.mentor.findUnique({
    where: { id },
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
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  return mapToMentorResponse(mentor);
};

export const getMentorByUserId = async (userId: string): Promise<MentorResponse> => {
  const mentor = await prisma.mentor.findUnique({
    where: { userId },
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
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  return mapToMentorResponse(mentor);
};

export const getMentorWithProjects = async (id: string): Promise<MentorWithProjectsResponse> => {
  const mentor = await prisma.mentor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      projects: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          deadline: true,
          createdAt: true,
        },
      },
    },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  return {
    ...mapToMentorResponse(mentor),
    projects: mentor.projects.map((project) => ({
      ...project,
      description: project.description ?? undefined,
      deadline: project.deadline ?? undefined,
    })),
  };
};

export const getAllMentors = async (query: MentorListQuery): Promise<MentorListResponse> => {
  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "10");
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.verified !== undefined) {
    where.verified = query.verified === "true";
  }

  if (query.expertise) {
    where.expertise = {
      contains: query.expertise,
      mode: "insensitive",
    };
  }

  if (query.search) {
    where.OR = [
      {
        user: {
          name: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      },
      {
        expertise: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        bio: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [mentors, total] = await Promise.all([
    prisma.mentor.findMany({
      where,
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
      skip,
      take: limit,
      orderBy: {
        user: {
          name: "asc",
        },
      },
    }),
    prisma.mentor.count({ where }),
  ]);

  return {
    mentors: mentors.map((mentor) => mapToMentorResponse(mentor)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateMentor = async (
  userId: string,
  data: UpdateMentorDTO,
): Promise<MentorResponse> => {
  const mentor = await prisma.mentor.findUnique({
    where: { userId },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  const updatedMentor = await prisma.mentor.update({
    where: { userId },
    data: {
      expertise: data.expertise,
      bio: data.bio,
    },
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
  });

  return mapToMentorResponse(updatedMentor);
};

export const updateMentorById = async (
  id: string,
  data: UpdateMentorByIdDTO,
): Promise<MentorResponse> => {
  const mentor = await prisma.mentor.findUnique({
    where: { id },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  const updatedMentor = await prisma.mentor.update({
    where: { id },
    data: {
      expertise: data.expertise,
      bio: data.bio,
      verified: data.verified,
    },
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
  });

  return mapToMentorResponse(updatedMentor);
};

export const deleteMentorById = async (id: string): Promise<void> => {
  const mentor = await prisma.mentor.findUnique({
    where: { id },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  await prisma.mentor.delete({
    where: { id },
  });
};

export const verifyMentor = async (id: string): Promise<MentorResponse> => {
  return updateMentorById(id, { verified: true });
};

export const unverifyMentor = async (id: string): Promise<MentorResponse> => {
  return updateMentorById(id, { verified: false });
};

export const getVerifiedMentors = async (limit: number = 10): Promise<MentorResponse[]> => {
  const mentors = await prisma.mentor.findMany({
    where: { verified: true },
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
    take: limit,
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return mentors.map((mentor) => mapToMentorResponse(mentor));
};
