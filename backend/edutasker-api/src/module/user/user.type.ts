export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDTO {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAvatarDTO {
  avatarUrl: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserListResponse {
  users: UserProfileResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserByIdDTO {
  name?: string;
  email?: string;
  avatarUrl?: string;
}
