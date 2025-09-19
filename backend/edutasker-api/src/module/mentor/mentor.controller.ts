import type { Request, Response } from "express";
import * as MentorService from "./mentor.service.js";
import type {
  CreateMentorDTO,
  UpdateMentorDTO,
  UpdateMentorByIdDTO,
  MentorListQuery,
} from "./mentor.type.js";
import { serviceWrapper } from "../../helper/service-wrapper.js";

const createMentorHandler = async (req: Request, res: Response) => {
  const data: CreateMentorDTO = req.body;
  return await MentorService.createMentor(data);
};

const getMentorByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Mentor ID is required");
  }
  return await MentorService.getMentorById(id);
};

const getMentorByUserIdHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await MentorService.getMentorByUserId(userId);
};

const getMentorWithProjectsHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Mentor ID is required");
  }
  return await MentorService.getMentorWithProjects(id);
};

const getAllMentorsHandler = async (req: Request, res: Response) => {
  const query: MentorListQuery = req.query;
  return await MentorService.getAllMentors(query);
};

const getMyMentorProfileHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  return await MentorService.getMentorByUserId(userId);
};

const updateMyMentorProfileHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data: UpdateMentorDTO = req.body;
  return await MentorService.updateMentor(userId, data);
};

const updateMentorByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Mentor ID is required");
  }
  const data: UpdateMentorByIdDTO = req.body;
  return await MentorService.updateMentorById(id, data);
};

const deleteMentorByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Mentor ID is required");
  }
  await MentorService.deleteMentorById(id);
  return { message: "Mentor deleted successfully" };
};

const verifyMentorHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Mentor ID is required");
  }
  return await MentorService.verifyMentor(id);
};

const unverifyMentorHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Mentor ID is required");
  }
  return await MentorService.unverifyMentor(id);
};

const getVerifiedMentorsHandler = async (req: Request, res: Response) => {
  const limit = req.query.limit
    ? Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10))
    : 10;
  return await MentorService.getVerifiedMentors(limit);
};

export const createMentor = serviceWrapper(createMentorHandler, "Mentor created successfully");
export const getMentorById = serviceWrapper(getMentorByIdHandler, "Mentor retrieved successfully");
export const getMentorByUserId = serviceWrapper(
  getMentorByUserIdHandler,
  "Mentor retrieved successfully",
);
export const getMentorWithProjects = serviceWrapper(
  getMentorWithProjectsHandler,
  "Mentor with projects retrieved successfully",
);
export const getAllMentors = serviceWrapper(getAllMentorsHandler, "Mentors retrieved successfully");
export const getMyMentorProfile = serviceWrapper(
  getMyMentorProfileHandler,
  "Mentor profile retrieved successfully",
);
export const updateMyMentorProfile = serviceWrapper(
  updateMyMentorProfileHandler,
  "Mentor profile updated successfully",
);
export const updateMentorById = serviceWrapper(
  updateMentorByIdHandler,
  "Mentor updated successfully",
);
export const deleteMentorById = serviceWrapper(
  deleteMentorByIdHandler,
  "Mentor deleted successfully",
);
export const verifyMentor = serviceWrapper(verifyMentorHandler, "Mentor verified successfully");
export const unverifyMentor = serviceWrapper(
  unverifyMentorHandler,
  "Mentor unverified successfully",
);
export const getVerifiedMentors = serviceWrapper(
  getVerifiedMentorsHandler,
  "Verified mentors retrieved successfully",
);
