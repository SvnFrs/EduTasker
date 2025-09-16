export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  task: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateCommentDTO {
  content: string;
}

export interface CommentListQuery {
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

export interface CommentListResponse {
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
