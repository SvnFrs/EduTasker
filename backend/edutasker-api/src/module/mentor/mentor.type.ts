export interface CreateMentorDTO {
  userId: string;
  expertise?: string;
  bio?: string;
}

export interface UpdateMentorDTO {
  expertise?: string;
  bio?: string;
}

export interface UpdateMentorByIdDTO extends UpdateMentorDTO {
  verified?: boolean;
}

export interface MentorResponse {
  id: string;
  userId: string;
  expertise: string | undefined;
  bio: string | undefined;
  verified: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | undefined;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MentorWithProjectsResponse extends MentorResponse {
  projects: {
    id: string;
    name: string;
    description: string | undefined;
    status: string;
    deadline: Date | undefined;
    createdAt: Date;
  }[];
}

export interface MentorListQuery {
  verified?: string;
  expertise?: string;
  page?: string;
  limit?: string;
  search?: string;
}

export interface MentorListResponse {
  mentors: MentorResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MentorIdParam {
  id: string;
}

export interface UserIdParam {
  userId: string;
}
